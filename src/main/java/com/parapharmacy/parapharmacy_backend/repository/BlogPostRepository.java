package com.parapharmacy.parapharmacy_backend.repository;

import com.parapharmacy.parapharmacy_backend.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Page<BlogPost> findByPublishedTrueOrderByPublishedAtDesc(Pageable pageable);
    Page<BlogPost> findByCategoryAndPublishedTrueOrderByPublishedAtDesc(String category, Pageable pageable);
    Optional<BlogPost> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
