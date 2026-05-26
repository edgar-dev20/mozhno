package ru.mozhno.flags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.tags.TagRepository;

import java.util.List;

@Service
public class FlagService {
    private final FlagRepository flagRepository;
    private final ProjectRepository projectRepository;
    private final TagRepository tagRepository;
    private final FlagTagValueRepository flagTagValueRepository;

    public FlagService(FlagRepository flagRepository, ProjectRepository projectRepository,
                       TagRepository tagRepository, FlagTagValueRepository flagTagValueRepository) {
        this.flagRepository = flagRepository;
        this.projectRepository = projectRepository;
        this.tagRepository = tagRepository;
        this.flagTagValueRepository = flagTagValueRepository;
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
    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        Flag flag = flagRepository.findByProjectIdAndKey(projectId, key);
        if (flag == null) throw new RuntimeException("Flag not found: " + key);
        return flag;
    }

    @Transactional
    public Flag create(FlagRequest request) {
        if (projectRepository.findById(request.getProjectId()) == null) {
            throw new RuntimeException("Project not found: " + request.getProjectId());
        }
        Flag flag = new Flag();
        flag.setProjectId(request.getProjectId());
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
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
        return flag;
    }

    @Transactional
    public Flag update(Integer id, FlagRequest request) {
        Flag flag = flagRepository.findById(id);
        if (flag == null) throw new RuntimeException("Flag not found: " + id);
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
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
        return flag;
    }

    @Transactional
    public void delete(Integer id) {
        flagTagValueRepository.deleteByFlagId(id);
        flagRepository.deleteById(id);
    }
}