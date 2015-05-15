package core;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Created by evolution on 16/07/2014.
 */
public class TemporalValue {
    private long date;
    private double column;
    private double quality;
    private List<AffectedChannel> affectedChannels;
    private List<String> affectingIndicators;


    public TemporalValue(){
        //jackson
    }

    public TemporalValue(long date, double column, double quality){
        this.date = date;
        this.column = column;
        this.quality = quality;
    }

    public TemporalValue(long date, double column, double quality, List<AffectedChannel> affectedChannels){
        this(date, column, quality);
        this.affectedChannels = affectedChannels;
    }

    public TemporalValue(long date, double column, double quality, List<AffectedChannel> affectedChannels, List<String> affectingIndicators){
        this(date, column, quality, affectedChannels);
        this.affectingIndicators= affectingIndicators;
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
    public double getQuality() {
        return quality;
    }

    @JsonProperty
    public List<AffectedChannel> getAffectedChannels() {
        return affectedChannels;
    }

    @JsonProperty
    public List<String> getAffectingIndicators() {
        return affectingIndicators;
    }

    public void setAffectingIndicators(List<String> affectingIndicators) {
        this.affectingIndicators = affectingIndicators;
    }

    public void setAffectedChannels(List<AffectedChannel> affectedChannels) {
        this.affectedChannels = affectedChannels;
    }

}
