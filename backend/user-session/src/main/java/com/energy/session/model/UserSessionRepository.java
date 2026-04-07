package com.energy.session.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM UserSession s WHERE s.user.id = ?1")
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < ?1")
    int deleteExpiredBefore(LocalDateTime cutoff);
}
