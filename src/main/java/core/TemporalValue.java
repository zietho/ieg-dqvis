package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 16/07/2014.
 */
public class TemporalValue {
    private long date;
    private double column;
    private int quality;

    public TemporalValue(){
        //jackson
    }

    public TemporalValue(long date, double column, int quality){
        this.date = date;
        this.column = column;
        this.quality = quality;
    }

    @JsonProperty
    public long getDate() {
        return this.date;
    }

    @JsonProperty
    public double getColumn() {
        return column;
    }

    @JsonProperty
    public int getQuality() {
        return quality;
    }
}
