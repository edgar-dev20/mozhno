package dev.mozhno.tags;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TagAssembler {

    public TagResponse toResponse(Tag tag) {
        return TagResponse.builder()
            .id(tag.getId())
            .name(tag.getName())
            .description(tag.getDescription())
            .color(tag.getColor())
            .projectId(tag.getProjectId())
            .createdAt(tag.getCreatedAt())
            .build();
    }

    public List<TagResponse> toResponseList(List<Tag> tags) {
        return tags.stream().map(this::toResponse).toList();
    }
}
