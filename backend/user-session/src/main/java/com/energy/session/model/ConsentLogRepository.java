package com.energy.session.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsentLogRepository extends JpaRepository<ConsentLog, Long> {
    List<ConsentLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
