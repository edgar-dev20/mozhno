package ru.mozhno.flags.strategy;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flags/{flagId}/strategies")
@RequiredArgsConstructor
@Tag(name = "Strategies", description = "Flag strategy management")
public class StrategyController {
    private final StrategyService strategyService;

    @GetMapping
    @Operation(summary = "Get all strategies for a flag")
    public List<FlagStrategy> getAll(@PathVariable Integer flagId,
                                     @AuthenticationPrincipal UserPrincipal user) {
        return strategyService.findByFlagId(flagId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new strategy")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagStrategy create(@PathVariable Integer flagId, @Valid @RequestBody StrategyRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        request.setFlagId(flagId);
        return strategyService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a strategy")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void delete(@PathVariable Integer flagId, @PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        strategyService.delete(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a strategy")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagStrategy update(@PathVariable Integer flagId, @PathVariable Integer id,
                               @Valid @RequestBody StrategyRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        return strategyService.update(id, request);
    }

    @PutMapping
    @Operation(summary = "Upsert strategy for flag and environment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagStrategy upsert(@PathVariable Integer flagId, @Valid @RequestBody StrategyRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        request.setFlagId(flagId);
        return strategyService.upsert(request);
    }
}