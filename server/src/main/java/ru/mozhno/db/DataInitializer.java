package ru.mozhno.db;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.contexts.ContextDefinition;
import ru.mozhno.contexts.ContextDefinitionRepository;
import ru.mozhno.contexts.ContextValue;
import ru.mozhno.contexts.ContextValueRepository;
import ru.mozhno.environments.Environment;
import ru.mozhno.environments.EnvironmentRepository;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagRepository;
import ru.mozhno.flags.strategy.FlagStrategyRepository;
import ru.mozhno.flags.strategy.GradualStrategy;
import ru.mozhno.flags.strategy.ServerStrategy;
import ru.mozhno.flags.strategy.TargetingStrategy;
import ru.mozhno.projects.Project;
import ru.mozhno.projects.ProjectRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final ProjectRepository projectRepository;
    private final FlagRepository flagRepository;
    private final FlagStrategyRepository strategyRepository;
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;
    private final EnvironmentRepository environmentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (projectRepository.count() > 0) {
            return;
        }

        Project defaultProject = new Project();
        defaultProject.setName("Default Project");
        defaultProject.setDescription("Default feature flags project");
        defaultProject = projectRepository.save(defaultProject);

        Environment devEnv = new Environment();
        devEnv.setProjectId(defaultProject.getId());
        devEnv.setName("development");
        devEnv = environmentRepository.save(devEnv);

        Environment prodEnv = new Environment();
        prodEnv.setProjectId(defaultProject.getId());
        prodEnv.setName("production");
        prodEnv = environmentRepository.save(prodEnv);

        Flag enabledFlag = new Flag();
        enabledFlag.setProjectId(defaultProject.getId());
        enabledFlag.setName("Feature Enabled");
        enabledFlag.setKey("feature-enabled");
        enabledFlag.setDescription("Simple on/off feature");
        enabledFlag = flagRepository.save(enabledFlag);

        ServerStrategy serverStrategy = new ServerStrategy();
        serverStrategy.setFlag(enabledFlag);
        serverStrategy.setEnvironmentId(devEnv.getId());
        serverStrategy.setEnabled(true);
        strategyRepository.save(serverStrategy);

        Flag gradualFlag = new Flag();
        gradualFlag.setProjectId(defaultProject.getId());
        gradualFlag.setName("Gradual Rollout");
        gradualFlag.setKey("gradual-rollout");
        gradualFlag.setDescription("Gradual percentage rollout");
        gradualFlag = flagRepository.save(gradualFlag);

        GradualStrategy gradualStrategy = new GradualStrategy();
        gradualStrategy.setFlag(gradualFlag);
        gradualStrategy.setEnvironmentId(devEnv.getId());
        gradualStrategy.setEnabled(true);
        gradualStrategy.setPercentage(50.0);
        strategyRepository.save(gradualStrategy);

        GradualStrategy gradualStrategyProd = new GradualStrategy();
        gradualStrategyProd.setFlag(gradualFlag);
        gradualStrategyProd.setEnvironmentId(prodEnv.getId());
        gradualStrategyProd.setEnabled(true);
        gradualStrategyProd.setPercentage(10.0);
        strategyRepository.save(gradualStrategyProd);

        ContextDefinition appNameContext = new ContextDefinition();
        appNameContext.setProjectId(defaultProject.getId());
        appNameContext.setName("appName");
        appNameContext.setDescription("Application name");
        appNameContext = contextDefinitionRepository.save(appNameContext);

        ContextValue appNameValues = new ContextValue();
        appNameValues.setContextDefinitionId(appNameContext.getId());
        appNameValues.setValues("[\"web\",\"mobile\",\"desktop\"]");
        contextValueRepository.save(appNameValues);

        ContextDefinition userIdContext = new ContextDefinition();
        userIdContext.setProjectId(defaultProject.getId());
        userIdContext.setName("userId");
        userIdContext.setDescription("User identifier");
        userIdContext = contextDefinitionRepository.save(userIdContext);

        ContextValue userIdPremium = new ContextValue();
        userIdPremium.setContextDefinitionId(userIdContext.getId());
        userIdPremium.setValues("[\"premium-user-1\",\"premium-user-2\"]");
        contextValueRepository.save(userIdPremium);

        Flag targetingFlag = new Flag();
        targetingFlag.setProjectId(defaultProject.getId());
        targetingFlag.setName("Targeted Feature");
        targetingFlag.setKey("targeted-feature");
        targetingFlag.setDescription("Feature for specific users");
        targetingFlag = flagRepository.save(targetingFlag);

        TargetingStrategy targetingStrategy = new TargetingStrategy();
        targetingStrategy.setFlag(targetingFlag);
        targetingStrategy.setEnvironmentId(devEnv.getId());
        targetingStrategy.setEnabled(true);
        targetingStrategy.setContextDefinitionId(userIdContext.getId());
        targetingStrategy.setContextValuesJson("[\"premium-user-1\",\"premium-user-2\"]");
        targetingStrategy.setRolloutPercentage(100.0);
        strategyRepository.save(targetingStrategy);
    }
}