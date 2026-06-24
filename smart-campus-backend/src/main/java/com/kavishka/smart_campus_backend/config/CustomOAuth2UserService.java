package com.kavishka.smart_campus_backend.config;

import com.kavishka.smart_campus_backend.model.AppUser;
import com.kavishka.smart_campus_backend.repository.AppUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomOAuth2UserService extends OidcUserService {

    private final AppUserRepository appUserRepository;

    public CustomOAuth2UserService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        // Load user from Google
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName() != null ? oidcUser.getFullName() : oidcUser.getAttribute("name");
        String sub = oidcUser.getSubject();

        // Save or update user in MongoDB
        AppUser appUser = appUserRepository.findByEmail(email)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setId(email);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setGoogleSub(sub);
                    newUser.setRole("USER");
                    return appUserRepository.save(newUser);
                });

        // Add Spring Security role
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + appUser.getRole())
        );

        // Return OidcUser with correct authorities
        return new DefaultOidcUser(
                authorities,
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        );
    }
}