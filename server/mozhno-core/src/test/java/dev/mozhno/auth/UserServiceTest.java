package dev.mozhno.auth;

import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private DomainEventPublisher events;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder, events);
    }

    @Test
    void delete_shouldAllowLastAdminDeletionWhenNoChildren() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(0);

        assertDoesNotThrow(() -> userService.delete(1));
        verify(userRepository).delete(1);
    }

    @Test
    void delete_shouldAllowAdminDeletionWhenOtherAdminInGroup() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(3);
        when(userRepository.countAdminsCreatedBy(1, 1)).thenReturn(1);

        assertDoesNotThrow(() -> userService.delete(1));
        verify(userRepository).delete(1);
    }

    @Test
    void delete_shouldBlockLastAdminDeletionWithChildren() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(2);
        when(userRepository.countAdminsCreatedBy(1, 1)).thenReturn(0);

        ConflictException ex = assertThrows(ConflictException.class, () -> userService.delete(1));
        assertTrue(ex.getMessage().contains("last admin"));
        verify(userRepository, never()).delete(anyInt());
    }

    @Test
    void delete_shouldAllowNonAdminDeletionEvenWithChildren() {
        User user = new User();
        user.setId(1);
        user.setRole("developer");
        when(userRepository.findById(1)).thenReturn(user);

        assertDoesNotThrow(() -> userService.delete(1));
        verify(userRepository).delete(1);
        verify(userRepository, never()).countByCreatedBy(anyInt());
    }

    @Test
    void delete_shouldSucceedWhenUserNotFound() {
        when(userRepository.findById(99)).thenReturn(null);

        assertDoesNotThrow(() -> userService.delete(99));
        verify(userRepository, never()).delete(99);
    }

    @Test
    void update_demotingLastAdminWithChildren_shouldThrow() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(2);
        when(userRepository.countAdminsCreatedBy(1, 1)).thenReturn(0);

        UserUpdateRequest request = new UserUpdateRequest(null, null, null, "developer", null, null);

        ConflictException ex = assertThrows(ConflictException.class, () -> userService.update(1, request));
        assertTrue(ex.getMessage().contains("last admin"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void update_demotingAdminWithOtherAdminInGroup_shouldSucceed() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(3);
        when(userRepository.countAdminsCreatedBy(1, 1)).thenReturn(1);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserUpdateRequest request = new UserUpdateRequest(null, null, null, "developer", null, null);

        assertDoesNotThrow(() -> userService.update(1, request));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void update_changingNameOnly_shouldNotCheckLastAdmin() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserUpdateRequest request = new UserUpdateRequest(null, null, "New Name", null, null, null);

        assertDoesNotThrow(() -> userService.update(1, request));
        verify(userRepository).save(any(User.class));
        verify(userRepository, never()).countByCreatedBy(anyInt());
    }

    @Test
    void update_demotingAdminWithoutChildren_shouldSucceed() {
        User user = new User();
        user.setId(1);
        user.setRole("admin");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.countByCreatedBy(1)).thenReturn(0);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserUpdateRequest request = new UserUpdateRequest(null, null, null, "viewer", null, null);

        assertDoesNotThrow(() -> userService.update(1, request));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void update_promotingNonAdmin_shouldNotCheckLastAdmin() {
        User user = new User();
        user.setId(1);
        user.setRole("developer");
        when(userRepository.findById(1)).thenReturn(user);
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserUpdateRequest request = new UserUpdateRequest(null, null, null, "admin", null, null);

        assertDoesNotThrow(() -> userService.update(1, request));
        verify(userRepository).save(any(User.class));
        verify(userRepository, never()).countByCreatedBy(anyInt());
    }
}
