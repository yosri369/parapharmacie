package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.GenerationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GenerationTaskRepository extends JpaRepository<GenerationTask, UUID> {
    List<GenerationTask> findByProductIdOrderByCreatedAtDesc(Long productId);
}
