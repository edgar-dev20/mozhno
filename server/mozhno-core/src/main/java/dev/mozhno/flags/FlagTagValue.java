package dev.mozhno.flags;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

/**
 * Join entity linking a flag to a tag with a specific value.
 */
@Getter
@Setter
@NoArgsConstructor
public class FlagTagValue {
    private Integer id;
    private Integer flagId;
    private Integer tagId;
    private String tagValue;
}