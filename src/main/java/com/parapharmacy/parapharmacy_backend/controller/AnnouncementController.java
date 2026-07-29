package com.parapharmacy.parapharmacy_backend.controller;

import com.parapharmacy.parapharmacy_backend.entity.Announcement;
import com.parapharmacy.parapharmacy_backend.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository repo;

    /** PUBLIC — returns only active announcements */
    @GetMapping("/announcements")
    public List<Announcement> getActive() {
        return repo.findByActiveTrueOrderBySortOrderAsc();
    }

    /** ADMIN — get all */
    @GetMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Announcement> getAll() {
        return repo.findAll();
    }

    /** ADMIN — create */
    @PostMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement create(@RequestBody Announcement a) {
        return repo.save(a);
    }

    /** ADMIN — update */
    @PutMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Announcement> update(@PathVariable Long id, @RequestBody Announcement body) {
        return repo.findById(id).map(a -> {
            a.setMessage(body.getMessage());
            a.setType(body.getType());
            a.setActive(body.isActive());
            a.setLinkUrl(body.getLinkUrl());
            a.setLinkLabel(body.getLinkLabel());
            a.setSortOrder(body.getSortOrder());
            return ResponseEntity.ok(repo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** ADMIN — toggle active */
    @PatchMapping("/admin/announcements/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Announcement> toggle(@PathVariable Long id) {
        return repo.findById(id).map(a -> {
            a.setActive(!a.isActive());
            return ResponseEntity.ok(repo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** ADMIN — delete */
    @DeleteMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
