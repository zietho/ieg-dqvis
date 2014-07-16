package core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * Created by evolution on 11/07/2014.
 */
public class TemporalColumn {
    String name;
    List<TemporalValue> column;

    public TemporalColumn(){
        //desirialize by json
    }

    @JsonProperty
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty
    public List<TemporalValue> getColumn() {
        return column;
    }

    public void setColumn(List<TemporalValue> column) {
        this.column = column;
    }

    public void add(TemporalValue temporalValue){
        column.add(temporalValue);
    }
}

