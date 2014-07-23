package core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by evolution on 11/07/2014.
 */
public class TemporalColumn {
    String name;
    List<TemporalValue> values;

    public TemporalColumn(){
        this.values = new ArrayList<TemporalValue>();
        //desirialize by json
    }

    public TemporalColumn(String name){
        this();
        this.name=name;
    }

    @JsonProperty
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty
    public List<TemporalValue> getValues() {
        return values;
    }

    public void setValues(List<TemporalValue> values) {
        this.values = values;
    }


    public void add(TemporalValue temporalValue){
        values.add(temporalValue);
    }
}

