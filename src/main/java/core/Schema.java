package core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by evolution on 13/07/2014.
 */
public class Schema {
    List<core.Column> columns;
    int values;

    public Schema(){
        columns =  new ArrayList<core.Column>();
    }

    @JsonProperty
    public List<core.Column> getColumns() {
        return columns;
    }

    @JsonProperty
    public int getValues(){
        return values;
    }

    public void setValues(int values) {
        this.values = values;
    }

    public void addColumn(core.Column column){
        columns.add(column);
    }

    public void setColumns(List<core.Column> columns) {
        this.columns = columns;
    }
}
