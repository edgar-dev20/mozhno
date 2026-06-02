package ru.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagRepository;
import ru.mozhno.flags.strategy.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StrategyServiceTest {

    @Mock
    private FlagStrategyRepository strategyRepository;

    @Mock
    private FlagRepository flagRepository;

    private StrategyService strategyService;

    @BeforeEach
    void setUp() {
        strategyService = new StrategyService(strategyRepository, flagRepository);
    }

    @Test
    void findByFlagId_shouldReturnStrategies() {
        Flag flag = new Flag();
        flag.setId(1);
        when(flagRepository.findById(1)).thenReturn(flag);
        FlagStrategy s = new FlagStrategy();
        s.setId(1);
        when(strategyRepository.findByFlagId(1)).thenReturn(List.of(s));

        List<FlagStrategy> result = strategyService.findByFlagId(1);
        assertEquals(1, result.size());
    }

    @Test
    void findByFlagId_shouldThrowExceptionWhenFlagNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> strategyService.findByFlagId(999));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void create_shouldCreateStrategy() {
        Flag flag = new Flag();
        flag.setId(1);
        when(flagRepository.findById(1)).thenReturn(flag);
        when(strategyRepository.save(any(FlagStrategy.class))).thenAnswer(inv -> {
            FlagStrategy s = inv.getArgument(0);
            s.setId(10);
            return s;
        });

        StrategyRequest req = new StrategyRequest();
        req.setFlagId(1);
        req.setEnvironmentId(2);
        req.setEnabled(true);
        req.setPercentage(50.0);
        req.setSegmentId(5);

        FlagStrategy result = strategyService.create(req);
        assertTrue(result.isEnabled());
        assertEquals(50.0, result.getPercentage());
        assertEquals(5, result.getSegmentId());
    }

    @Test
    void create_shouldCreateStrategyWithContext() {
        Flag flag = new Flag();
        flag.setId(1);
        when(flagRepository.findById(1)).thenReturn(flag);
        when(strategyRepository.save(any(FlagStrategy.class))).thenAnswer(inv -> {
            FlagStrategy s = inv.getArgument(0);
            s.setId(10);
            return s;
        });

        StrategyRequest req = new StrategyRequest();
        req.setFlagId(1);
        req.setEnvironmentId(2);
        req.setEnabled(true);
        req.setPercentage(30.0);
        req.setContextDefinitionId(3);
        req.setContextValuesJson("[\"web\"]");

        FlagStrategy result = strategyService.create(req);
        assertTrue(result.isEnabled());
        assertEquals(30.0, result.getPercentage());
        assertEquals(3, result.getContextDefinitionId());
        assertEquals("[\"web\"]", result.getContextValuesJson());
    }

    @Test
    void create_shouldThrowExceptionWhenFlagNotFound() {
        when(flagRepository.findById(999)).thenReturn(null);

        StrategyRequest req = new StrategyRequest();
        req.setFlagId(999);
        req.setEnvironmentId(2);
        req.setEnabled(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> strategyService.create(req));
        assertTrue(ex.getMessage().contains("Flag not found"));
    }

    @Test
    void update_shouldUpdateStrategy() {
        FlagStrategy existing = new FlagStrategy();
        existing.setId(1);
        existing.setEnabled(false);
        when(strategyRepository.findById(1)).thenReturn(existing);
        when(strategyRepository.save(any(FlagStrategy.class))).thenReturn(existing);

        StrategyRequest req = new StrategyRequest();
        req.setEnabled(true);

        FlagStrategy result = strategyService.update(1, req);
        assertTrue(result.isEnabled());
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(strategyRepository.findById(999)).thenReturn(null);

        StrategyRequest req = new StrategyRequest();
        req.setEnabled(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> strategyService.update(999, req));
        assertTrue(ex.getMessage().contains("Strategy not found"));
    }

    @Test
    void update_shouldUpdatePercentage() {
        FlagStrategy existing = new FlagStrategy();
        existing.setId(1);
        existing.setPercentage(10.0);
        when(strategyRepository.findById(1)).thenReturn(existing);
        when(strategyRepository.save(any(FlagStrategy.class))).thenReturn(existing);

        StrategyRequest req = new StrategyRequest();
        req.setEnabled(true);
        req.setPercentage(75.0);

        FlagStrategy result = strategyService.update(1, req);
        assertEquals(75.0, result.getPercentage());
    }

    @Test
    void update_shouldUpdateContextFields() {
        FlagStrategy existing = new FlagStrategy();
        existing.setId(1);
        when(strategyRepository.findById(1)).thenReturn(existing);
        when(strategyRepository.save(any(FlagStrategy.class))).thenReturn(existing);

        StrategyRequest req = new StrategyRequest();
        req.setEnabled(true);
        req.setContextDefinitionId(5);
        req.setContextValuesJson("[\"mobile\"]");
        req.setSegmentId(7);

        FlagStrategy result = strategyService.update(1, req);
        assertEquals(5, existing.getContextDefinitionId());
        assertEquals("[\"mobile\"]", existing.getContextValuesJson());
        assertEquals(7, existing.getSegmentId());
    }

    @Test
    void upsert_shouldCreateWhenNotExists() {
        when(strategyRepository.findByFlagIdAndEnvironmentId(1, 2)).thenReturn(null);
        Flag flag = new Flag();
        flag.setId(1);
        when(flagRepository.findById(1)).thenReturn(flag);
        when(strategyRepository.save(any(FlagStrategy.class))).thenAnswer(inv -> {
            FlagStrategy s = inv.getArgument(0);
            s.setId(10);
            return s;
        });

        StrategyRequest req = new StrategyRequest();
        req.setFlagId(1);
        req.setEnvironmentId(2);
        req.setEnabled(true);

        FlagStrategy result = strategyService.upsert(req);
        assertTrue(result.isEnabled());
    }

    @Test
    void upsert_shouldUpdateWhenExists() {
        FlagStrategy existing = new FlagStrategy();
        existing.setId(5);
        existing.setEnabled(false);
        when(strategyRepository.findByFlagIdAndEnvironmentId(1, 2)).thenReturn(existing);
        when(strategyRepository.save(any(FlagStrategy.class))).thenReturn(existing);

        StrategyRequest req = new StrategyRequest();
        req.setFlagId(1);
        req.setEnvironmentId(2);
        req.setEnabled(true);

        FlagStrategy result = strategyService.upsert(req);
        assertTrue(result.isEnabled());
    }

    @Test
    void delete_shouldCallRepository() {
        doNothing().when(strategyRepository).deleteById(1);
        strategyService.delete(1);
        verify(strategyRepository).deleteById(1);
    }
}