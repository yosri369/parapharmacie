package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.dto.BlogPostDTO;
import com.parapharmacy.parapharmacy_backend.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping
    public ResponseEntity<Page<BlogPostDTO>> getPosts(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "9")  int size,
            @RequestParam(required = false)    String category) {

        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(blogService.getPostsByCategory(category, page, size));
        }
        return ResponseEntity.ok(blogService.getPublishedPosts(page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostDTO> getPost(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getPostBySlug(slug));
    }
}
