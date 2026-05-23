package ru.mozhno.flags.strategy;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.flags.FlagService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Strategies", description = "Flag strategy management")
public class StrategyController {
    private final StrategyService strategyService;
    private final FlagService flagService;

    @GetMapping("/api/v1/flags/{flagId}/strategies")
    @Operation(summary = "Get all strategies for a flag")
    public List<FlagStrategy> getAll(@PathVariable Integer flagId) {
        return strategyService.findByFlagId(flagId);
    }

    @PostMapping("/api/v1/flags/{flagId}/strategies")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new strategy")
    public FlagStrategy create(@PathVariable Integer flagId, @RequestBody StrategyRequest request) {
        request.setFlagId(flagId);
        return strategyService.create(request);
    }

    @DeleteMapping("/api/v1/strategies/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a strategy")
    public void delete(@PathVariable Integer id) {
        strategyService.delete(id);
    }

    @PutMapping("/api/v1/strategies/{id}")
    @Operation(summary = "Update a strategy")
    public FlagStrategy update(@PathVariable Integer id, @RequestBody StrategyRequest request) {
        return strategyService.update(id, request);
    }
}