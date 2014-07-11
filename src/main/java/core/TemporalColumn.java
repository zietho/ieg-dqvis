package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 11/07/2014.
 */
public class TemporalColumn {
    private String date;
    private String column;
    private String quality;

    public TemporalColumn(String date, String column, String quality){
        this.date = date;
        this.column = column;
        this.quality=quality;
    }

    @JsonProperty
    public String getDate() {
        return date;
    }

    @JsonProperty
    public String getColumn() {
        return column;
    }

    @JsonProperty
    public String getQuality() {
        return quality;
    }
}
