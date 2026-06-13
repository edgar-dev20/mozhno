package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.util.MediaTypeUtils;

import java.util.List;

/**
 * REST controller for user management (CRUD operations).
 * All endpoints are restricted to administrators only.
 *
 * @see UserService
 * @see UserInviteService
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management — admin only")
public class UsersController {
    private final UserService userService;
    private final UserInviteService userInviteService;

    @GetMapping
    @Operation(summary = "Get all users (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getAll(@AuthenticationPrincipal UserPrincipal user) {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto getById(@PathVariable Integer id,
                           @AuthenticationPrincipal UserPrincipal user) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user with password (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto create(@Valid @RequestBody UserCreateRequest request,
                           @AuthenticationPrincipal UserPrincipal user) {
        return userService.create(request);
    }

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Invite a new user by email (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> invite(@Valid @RequestBody InviteUserRequest request,
                                         @AuthenticationPrincipal UserPrincipal user) {
        userInviteService.inviteUser(request, user.userId());
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Map.of("message", "Invitation sent to " + request.email()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto update(@PathVariable Integer id,
                           @Valid @RequestBody UserUpdateRequest request,
                           @AuthenticationPrincipal UserPrincipal user) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                        @AuthenticationPrincipal UserPrincipal user) {
        userService.delete(id);
    }

    @PostMapping("/{id}/avatar")
    @Operation(summary = "Upload an avatar image for a user")
    public UserDto uploadAvatar(@PathVariable Integer id,
                                 @RequestParam("file") MultipartFile file,
                                 @AuthenticationPrincipal UserPrincipal user) {
        if (!user.userId().equals(id) && !user.isAdmin()) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update another user's avatar");
        }
        if (!MediaTypeUtils.isImageContentType(file.getContentType())) {
            throw new org.springframework.security.access.AccessDeniedException("Only image files are allowed");
        }
        return userService.uploadAvatar(id, file);
    }

    @GetMapping("/{id}/avatar")
    @Operation(summary = "Get the avatar image for a user")
    public ResponseEntity<byte[]> getAvatar(@PathVariable Integer id,
                                             @AuthenticationPrincipal UserPrincipal user) {
        byte[] data = userService.getAvatarData(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType contentType = MediaTypeUtils.detectImageType(data);
        return ResponseEntity.ok()
                .contentType(contentType)
                .body(data);
    }
}