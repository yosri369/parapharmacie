package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.BlogPostDTO;
import com.parapharmacy.parapharmacy_backend.entity.BlogPost;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.repository.BlogPostRepository;
import com.parapharmacy.parapharmacy_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogPostRepository blogRepo;
    private final UserRepository userRepo;

    // ── Public ────────────────────────────────────────────────────────────────

    public Page<BlogPostDTO> getPublishedPosts(int page, int size) {
        return blogRepo.findByPublishedTrueOrderByPublishedAtDesc(PageRequest.of(page, size))
                       .map(this::toDTO);
    }

    public Page<BlogPostDTO> getPostsByCategory(String category, int page, int size) {
        return blogRepo.findByCategoryAndPublishedTrueOrderByPublishedAtDesc(category, PageRequest.of(page, size))
                       .map(this::toDTO);
    }

    public BlogPostDTO getPostBySlug(String slug) {
        return blogRepo.findBySlug(slug)
                       .filter(BlogPost::isPublished)
                       .map(this::toDTO)
                       .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    public Page<BlogPostDTO> getAllPosts(int page, int size) {
        return blogRepo.findAll(PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending()))
                       .map(this::toDTO);
    }

    @Transactional
    public BlogPostDTO createPost(BlogPostDTO req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepo.findByEmail(email).orElseThrow();

        String slug = toSlug(req.getTitle());
        if (blogRepo.existsBySlug(slug)) slug = slug + "-" + System.currentTimeMillis();

        BlogPost post = BlogPost.builder()
                .title(req.getTitle())
                .slug(slug)
                .excerpt(req.getExcerpt())
                .content(req.getContent())
                .imageUrl(req.getImageUrl())
                .category(req.getCategory())
                .authorName(author.getFirstName() + " " + author.getLastName())
                .readTimeMinutes(calculateReadTime(req.getContent()))
                .published(req.isPublished())
                .publishedAt(req.isPublished() ? LocalDateTime.now() : null)
                .author(author)
                .build();

        return toDTO(blogRepo.save(post));
    }

    @Transactional
    public BlogPostDTO updatePost(Long id, BlogPostDTO req) {
        BlogPost post = blogRepo.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setTitle(req.getTitle());
        post.setExcerpt(req.getExcerpt());
        post.setContent(req.getContent());
        post.setImageUrl(req.getImageUrl());
        post.setCategory(req.getCategory());
        post.setReadTimeMinutes(calculateReadTime(req.getContent()));
        if (req.isPublished() && !post.isPublished()) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setPublished(req.isPublished());
        return toDTO(blogRepo.save(post));
    }

    public void deletePost(Long id) {
        blogRepo.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BlogPostDTO toDTO(BlogPost p) {
        return BlogPostDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .excerpt(p.getExcerpt())
                .content(p.getContent())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .authorName(p.getAuthorName())
                .readTimeMinutes(p.getReadTimeMinutes())
                .published(p.isPublished())
                .createdAt(p.getCreatedAt())
                .publishedAt(p.getPublishedAt())
                .build();
    }

    private String toSlug(String title) {
        return title.toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-");
    }

    private int calculateReadTime(String content) {
        if (content == null) return 1;
        int words = content.split("\\s+").length;
        return Math.max(1, words / 200); // avg 200 wpm
    }
}
