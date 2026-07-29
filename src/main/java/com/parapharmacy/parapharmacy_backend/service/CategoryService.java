package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.CategoryDTO;
import com.parapharmacy.parapharmacy_backend.entity.Category;
import com.parapharmacy.parapharmacy_backend.repository.CategoryRepository;
import com.parapharmacy.parapharmacy_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByActiveTrue().stream().map(this::toDTO).toList();
    }

    public List<CategoryDTO> getRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue().stream().map(this::toDTO).toList();
    }

    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findById(id).map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO req) {
        Category category = Category.builder()
                .name(req.getName())
                .slug(req.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"))
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .icon(req.getIcon())
                .active(true)
                .build();
        if (req.getParentId() != null) {
            Category parent = categoryRepository.findById(req.getParentId()).orElseThrow();
            category.setParent(parent);
        }
        return toDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category cat = categoryRepository.findById(id).orElseThrow();
        cat.setActive(false);
        categoryRepository.save(cat);
    }

    private CategoryDTO toDTO(Category c) {
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .icon(c.getIcon())
                .active(c.isActive())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .productCount((int) productRepository.countByCategoryId(c.getId()))
                .build();
    }
}
