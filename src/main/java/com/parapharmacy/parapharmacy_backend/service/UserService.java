package com.parapharmacy.parapharmacy_backend.service;

import com.parapharmacy.parapharmacy_backend.dto.UpdateProfileRequest;
import com.parapharmacy.parapharmacy_backend.dto.UserProfileDTO;
import com.parapharmacy.parapharmacy_backend.entity.User;
import com.parapharmacy.parapharmacy_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDTO getProfile(User user) {
        return toDTO(user);
    }

    public UserProfileDTO updateProfile(User user, UpdateProfileRequest req) {
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getCountry() != null) user.setCountry(req.getCountry());
        userRepository.save(user);
        return toDTO(user);
    }

    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).toList();
    }

    private UserProfileDTO toDTO(User u) {
        return UserProfileDTO.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .address(u.getAddress())
                .city(u.getCity())
                .country(u.getCountry())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .build();
    }
}
