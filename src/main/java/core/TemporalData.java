package core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class TemporalData {
    private List<TemporalColumn> columns = new ArrayList<TemporalColumn>();

    public TemporalData() {
        // Jackson deserialization
    }

    @JsonProperty
    public List<TemporalColumn> getColumns() {
        return columns;
    }

    public void add(TemporalColumn dc){
        columns.add(dc);
    }

//    @JsonProperty
//    public TemporalColumn getColumn(String column){
//        for (int i = 0; i < columns.size(); i++) {
//            TemporalColumn temporalColumn = columns.get(i);
//            if (temporalColumn.equals(column)) {
//                return temporalColumn;
//            }
//        }
//
//        return new TemporalColumn();
//    }
}