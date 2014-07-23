package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 16/07/2014.
 */
public class TemporalValue {
    private long date;
    private String column;
    private int quality;

    public TemporalValue(){
        //jackson
    }

    public TemporalValue(long date, String column, int quality){
        this.date = date;
        this.column = column;
        this.quality = quality;
    }

    @JsonProperty
    public long getDate() {
        return this.date;
    }

    @JsonProperty
    public String getColumn() {
        return column;
    }

    @JsonProperty
    public int getQuality() {
        return quality;
    }
}
