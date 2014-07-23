package core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by evolution on 13/07/2014.
 */
public class Column {
    private String name;

    public Column(){
        //JACKSON
    }

    public Column(String name){
        setName(name);
    }

    @JsonProperty
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
