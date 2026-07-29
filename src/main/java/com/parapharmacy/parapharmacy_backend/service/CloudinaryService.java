package com.parapharmacy.parapharmacy_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
            "folder",          "vitanova/" + folder,
            "resource_type",   "image",
            "transformation",  "f_auto,q_auto,w_800,c_limit"
        ));
        return (String) result.get("secure_url");
    }

    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Failed to delete image from Cloudinary: {}", publicId);
        }
    }

    public String uploadProductImage(MultipartFile file) {
        try { return uploadImage(file, "products"); }
        catch (IOException e) { log.error("Failed to upload product image", e); return null; }
    }

    public String uploadBlogImage(MultipartFile file) {
        try { return uploadImage(file, "blog"); }
        catch (IOException e) { log.error("Failed to upload blog image", e); return null; }
    }
}
