package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(u.createdAt AS date), COUNT(u) " +
           "FROM User u " +
           "GROUP BY CAST(u.createdAt AS date) ORDER BY CAST(u.createdAt AS date) ASC")
    java.util.List<Object[]> userGrowthByDay();
}
