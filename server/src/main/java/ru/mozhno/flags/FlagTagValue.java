package ru.mozhno.flags;

import jakarta.persistence.*;
import ru.mozhno.tags.Tag;

@Entity
@Table(name = "flag_tag_values")
public class FlagTagValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "flag_id", nullable = false)
    private Flag flag;

    @ManyToOne
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Column(name = "tag_value", nullable = false)
    private String tagValue;

    public FlagTagValue() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Flag getFlag() { return flag; }
    public void setFlag(Flag flag) { this.flag = flag; }
    public Tag getTag() { return tag; }
    public void setTag(Tag tag) { this.tag = tag; }
    public String getTagValue() { return tagValue; }
    public void setTagValue(String tagValue) { this.tagValue = tagValue; }
}