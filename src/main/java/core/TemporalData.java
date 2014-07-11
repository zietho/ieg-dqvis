package core;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.validator.constraints.Length;

import java.util.ArrayList;
import java.util.List;

public class TemporalData {
    private List<TemporalColumn> data = new ArrayList<TemporalColumn>();

    public TemporalData() {
        // Jackson deserialization
    }

    @JsonProperty
    public List<TemporalColumn> getData() {
        return data;
    }

    public void add(TemporalColumn dc){
        data.add(dc);
    }
}