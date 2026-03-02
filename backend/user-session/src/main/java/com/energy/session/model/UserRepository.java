package com.energy.session.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findBySsoProviderAndSsoUserId(String ssoProvider, String ssoUserId);

    List<User> findByOrganization(String organization);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
}
