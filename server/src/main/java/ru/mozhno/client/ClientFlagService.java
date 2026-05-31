package ru.mozhno.client;

import org.springframework.stereotype.Service;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagRepository;

import java.util.List;

@Service
public class ClientFlagService {
    private final FlagRepository flagRepository;

    public ClientFlagService(FlagRepository flagRepository) {
        this.flagRepository = flagRepository;
    }

    public List<ClientFlagResponse> getFlagsForProject(Integer projectId, Integer environmentId) {
        List<Flag> flags = flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
        return flags.stream().map(ClientFlagResponse::new).toList();
    }
}