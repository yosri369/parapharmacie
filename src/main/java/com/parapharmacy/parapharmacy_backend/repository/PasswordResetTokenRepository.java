package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.PasswordResetToken;
import com.parapharmacy.parapharmacy_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
