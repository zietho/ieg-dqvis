package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 11/07/2014.
 */
public class TemporalColumn {
    private int date;
    private double column;
    private int quality;

    public TemporalColumn(){
        //jackson
    }

    public TemporalColumn(int date, double column, int quality){
        this.date = date;
        this.column = column;
        this.quality = quality;
    }

    @JsonProperty
    public int getDate() {
        return date;
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
