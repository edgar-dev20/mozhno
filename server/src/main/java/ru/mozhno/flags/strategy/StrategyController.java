package ru.mozhno.flags.strategy;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flags/{flagId}/strategies")
@RequiredArgsConstructor
@Tag(name = "Strategies", description = "Flag strategy management")
public class StrategyController {
    private final StrategyService strategyService;

    @GetMapping
    @Operation(summary = "Get all strategies for a flag")
    public List<FlagStrategy> getAll(@PathVariable Integer flagId) {
        return strategyService.findByFlagId(flagId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new strategy")
    public FlagStrategy create(@PathVariable Integer flagId, @Valid @RequestBody StrategyRequest request) {
        request.setFlagId(flagId);
        return strategyService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a strategy")
    public void delete(@PathVariable Integer flagId, @PathVariable Integer id) {
        strategyService.delete(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a strategy")
    public FlagStrategy update(@PathVariable Integer flagId, @PathVariable Integer id, @Valid @RequestBody StrategyRequest request) {
        return strategyService.update(id, request);
    }

    @PutMapping
    @Operation(summary = "Upsert strategy for flag and environment")
    public FlagStrategy upsert(@PathVariable Integer flagId, @Valid @RequestBody StrategyRequest request) {
        request.setFlagId(flagId);
        return strategyService.upsert(request);
    }
}