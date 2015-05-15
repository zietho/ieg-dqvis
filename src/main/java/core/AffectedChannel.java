package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 09/05/2015.
 */
public class AffectedChannel {
    private String name;
    private String indicator;

    public AffectedChannel(String name, String indicator){
        this.name = name;
        this.indicator = indicator;
    }

    @JsonProperty
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty
    public String getIndicator() {
        return indicator;
    }

    public void setIndicator(String indicator) {
        this.indicator = indicator;
    }
}
