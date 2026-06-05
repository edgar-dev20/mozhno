package ru.mozhno.flags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.tags.TagRepository;

import java.time.Instant;
import java.util.List;

@Service
public class FlagService {
    private final FlagRepository flagRepository;
    private final ProjectRepository projectRepository;
    private final TagRepository tagRepository;
    private final FlagTagValueRepository flagTagValueRepository;
    private final DomainEventPublisher events;

    public FlagService(FlagRepository flagRepository, ProjectRepository projectRepository,
                       TagRepository tagRepository, FlagTagValueRepository flagTagValueRepository,
                       DomainEventPublisher events) {
        this.flagRepository = flagRepository;
        this.projectRepository = projectRepository;
        this.tagRepository = tagRepository;
        this.flagTagValueRepository = flagTagValueRepository;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public Flag findById(Integer id) {
        Flag flag = flagRepository.findById(id);
        if (flag == null) throw new RuntimeException("Flag not found: " + id);
        return flag;
    }

    @Transactional(readOnly = true)
    public List<Flag> findByProjectId(Integer projectId) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        return flagRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public List<Flag> findByProjectIdIncludingArchived(Integer projectId) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        return flagRepository.findByProjectIdIncludingArchived(projectId);
    }

    @Transactional(readOnly = true)
    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        Flag flag = flagRepository.findByProjectIdAndKey(projectId, key);
        if (flag == null) throw new RuntimeException("Flag not found: " + key);
        return flag;
    }

    @Transactional(readOnly = true)
    public List<Flag> findByProjectIdWithStrategyForEnvironment(Integer projectId, Integer environmentId) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        return flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
    }

    @Transactional
    public Flag create(FlagRequest request) {
        return create(request, null);
    }

    @Transactional
    public Flag create(FlagRequest request, Integer creatorId) {
        if (projectRepository.findById(request.getProjectId()) == null) {
            throw new RuntimeException("Project not found: " + request.getProjectId());
        }
        Flag flag = new Flag();
        flag.setProjectId(request.getProjectId());
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        flag.setEnabled(request.getEnabled() != null ? request.getEnabled() : false);
        flag.setCreatorId(creatorId);
        if (request.getFlagType() != null) {
            try {
                flag.setFlagType(FlagType.valueOf(request.getFlagType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid flag type: " + request.getFlagType() + ". Must be RELEASE or KILLSWITCH");
            }
        }
        flag = flagRepository.save(flag);

        if (request.getTags() != null) {
            for (FlagRequest.TagValue tv : request.getTags()) {
                FlagTagValue ftv = new FlagTagValue();
                ftv.setFlagId(flag.getId());
                ftv.setTagId(tv.getTagId());
                if (tagRepository.findById(tv.getTagId()) == null) {
                    throw new RuntimeException("Tag not found: " + tv.getTagId());
                }
                ftv.setTagValue(tv.getValue());
                flagTagValueRepository.save(ftv);
            }
        }

        events.publish(new DomainEvent(flag.getProjectId(), "flag.created", "flag",
            flag.getId(), flag.getName(), "Flag created: " + flag.getKey()));
        return flag;
    }

    @Transactional
    public Flag update(Integer id, FlagRequest request) {
        Flag flag = flagRepository.findById(id);
        if (flag == null) throw new RuntimeException("Flag not found: " + id);
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        if (request.getEnabled() != null) {
            flag.setEnabled(request.getEnabled());
        }
        if (request.getFlagType() != null) {
            try {
                flag.setFlagType(FlagType.valueOf(request.getFlagType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid flag type: " + request.getFlagType() + ". Must be RELEASE or KILLSWITCH");
            }
        }
        flag = flagRepository.save(flag);

        flagTagValueRepository.deleteByFlagId(id);

        if (request.getTags() != null) {
            for (FlagRequest.TagValue tv : request.getTags()) {
                FlagTagValue ftv = new FlagTagValue();
                ftv.setFlagId(flag.getId());
                ftv.setTagId(tv.getTagId());
                if (tagRepository.findById(tv.getTagId()) == null) {
                    throw new RuntimeException("Tag not found: " + tv.getTagId());
                }
                ftv.setTagValue(tv.getValue());
                flagTagValueRepository.save(ftv);
            }
        }

        events.publish(new DomainEvent(flag.getProjectId(), "flag.updated", "flag",
            flag.getId(), flag.getName(), "Flag updated: " + flag.getKey()));
        return flag;
    }

    @Transactional
    public void delete(Integer id) {
        Flag flag = flagRepository.findById(id);
        String name = flag != null ? flag.getName() : String.valueOf(id);
        Integer projectId = flag != null ? flag.getProjectId() : null;
        flagTagValueRepository.deleteByFlagId(id);
        flagRepository.deleteById(id);
        events.publish(new DomainEvent(projectId, "flag.deleted", "flag",
            id, name, "Flag deleted"));
    }

    @Transactional
    public Flag archive(Integer id) {
        return archive(id, null);
    }

    @Transactional
    public Flag archive(Integer id, Integer archivedBy) {
        Flag flag = flagRepository.findById(id);
        if (flag == null) throw new RuntimeException("Flag not found: " + id);
        flagRepository.setArchived(id, true, archivedBy);
        flag.setArchived(true);
        flag.setArchivedBy(archivedBy);
        flag.setArchivedAt(Instant.now());
        events.publish(new DomainEvent(flag.getProjectId(), "flag.archived", "flag",
            flag.getId(), flag.getName(), "Flag archived: " + flag.getKey()));
        return flag;
    }

    @Transactional
    public Flag unarchive(Integer id) {
        Flag flag = flagRepository.findById(id);
        if (flag == null) throw new RuntimeException("Flag not found: " + id);
        flagRepository.clearArchived(id);
        flag.setArchived(false);
        flag.setArchivedBy(null);
        flag.setArchivedAt(null);
        events.publish(new DomainEvent(flag.getProjectId(), "flag.unarchived", "flag",
            flag.getId(), flag.getName(), "Flag unarchived: " + flag.getKey()));
        return flag;
    }
}