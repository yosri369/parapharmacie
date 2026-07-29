package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/product-image")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "products");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/blog-image")
    public ResponseEntity<Map<String, String>> uploadBlogImage(
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "blog");
        return ResponseEntity.ok(Map.of("url", url));
    }
}
