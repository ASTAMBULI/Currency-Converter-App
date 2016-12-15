$(document).ready(function() {
    //Page Loading
    /*=======================================
               Data Array
    =========================================*/
    //variables
    var countries,currencies,rates,popCurrency;
    var leftCombo=$("#filter-left");
    var rightCombo=$("#filter-right");
    var leftComboFlag=leftCombo.find("i:first-child[data-id=country]");
    var rightComboFlag=rightCombo.find("i:first-child[data-id=country]");
    var leftComboInput=leftCombo.find("input");
    var rightComboInput=rightCombo.find("input");
    var leftInput=$("#input-left");
    var rightInput=$("#input-right");
    var dropDown=$(".dropdown-menu");
    var calculateBtn=$(".calculate-button");
    var popular=$("#popular-list");
    var popularTable=popular.find("table");

    //Load Data
  

    function init() {
         $.getJSON("data/countries.json", function(results) {
            countries = results;
        }).done(function() {
            populateComboBox();
          }).fail(function() {
            console.log("error");
          });
     $.getJSON("data/currencies.json", function(results) {
            currencies = results;
        });

      $.getJSON("data/rates.json", function(results) {
            rates = results;
           
        }).done(function() {
          populateComboBox();
          }).fail(function() {

          });
       $.getJSON("data/pop.json", function(results) {
            popCurrency = results;
        }).done(function() {
            populatePopularTable();
          }).fail(function() {
            console.log("error");
          });

    }

      init();
      

    //Search Rates
    function searchRates(base) {
          var rateId=-1;
        $.each(rates,function(id,rate) {
            if (rate.base==base) {
                rateId=id;
                return false;
            }
       
    });
         return rateId;
}

    //Search Currency
    function searchCurrency(isoAlpa2Code) {
          var currencyId = -1;
        $.each(currencies, function(id, currency) {
            if (currency.code == isoAlpa2Code) {
                currencyId=id;
                return false;
            }
       
    });
         return currencyId;
}

    //Get currency code
    function getCurrencyConvectionRate(idBase,idOther) {
        var baseCurrency=currencies[idBase].currency;
        var otherCurrency=currencies[idOther].currency;
        var rateId=searchRates(baseCurrency);
        return rates[rateId].rates[otherCurrency];
    }
    //Get Currency title
    function currencyTitle(id) {
        var selCurrency=currencies[id];
       return selCurrency.currency+"-"+selCurrency.desc;
    }

    //Get Currency code
    function currencyCode(id) {
        var selCurrency=currencies[id];
       return selCurrency.currency;
    }
    //Create Drop down Item
    function createDropdownElement(isoAlpa2Code) {
        var element="<li data-id=\""+isoAlpa2Code+"\"><i class=\"flag flag-"+isoAlpa2Code+
                    "\"></i><a href=\"#\" >"+currencyTitle(searchCurrency(isoAlpa2Code))+" </a></li>";
        return element;
    }

    //create popular list item
    function popularItem(base,other,shade) {
       var shadeClass="";
       var change="green";
       var changeNum=(Math.floor(Math.random()*10)+1)/10000;
       if(changeNum<0.0005){
        changeNum=0-changeNum;
        change="red";
       }else{
        changeNum="+"+changeNum;
       }
       var rate=getCurrencyConvectionRate(searchCurrency(base),searchCurrency(other));
       if (shade) {
        shadeClass="shade";
       }
        var item="<tr class=\""+shadeClass+"\"><td  class=\"currencies\"><span data-id=\""+base+"\">"+currencyCode(searchCurrency(base))+"</span>/<span data-id=\""+other+"\">"+currencyCode(searchCurrency(other))+"</span></td>"+
                        "<td>"+roundNumber(rate,4)+"</td><td class=\""+change+"\">"+changeNum+"%</td></tr>";
        return item;
    }

    //Commbo values
    function comboValues(left,right) {
       //Assign Left combo values 
        leftComboFlag.attr("class","flag flag-"+left);
        leftComboInput.val(currencyTitle(searchCurrency(left)));
        leftCombo.attr("data-id",left);
        //Assign Right Combo values
        rightComboFlag.attr("class","flag flag-"+right);
        rightComboInput.val(currencyTitle(searchCurrency(right)));
        rightCombo.attr("data-id",right);

    }

    //add ComboBox Defaults
    function loadComboDefaults() {
        var leftDefault=countries.defaultLeft;
        var rightDefault=countries.defaultRight;
         comboValues(leftDefault,rightDefault);
    }

    //round nummbers
    function roundNumber(num,decimals) {
        var ten=Math.pow(10,decimals);
        return Math.round(num*ten)/ten;
    }

    //Calculate Exchange Rate
    function calculateExchangeRate() {
       var userAmount=leftInput.val();
       var leftCN=leftCombo.attr("data-id");
       var rightCN=rightCombo.attr("data-id");
       var rate=getCurrencyConvectionRate(searchCurrency(leftCN),searchCurrency(rightCN));
       leftInput.removeClass("error");
       if (userAmount==null || userAmount=="" || isNaN(userAmount)) {
        leftInput.addClass("error");
        return;
       }
       var convetion=userAmount*rate;
       if (convetion<10) {
            rightInput.val(roundNumber(convetion,5));
       }else{
            rightInput.val(roundNumber(convetion,2));
       }
       
    }


    //populate ComboBox
    function populateComboBox() {
        loadComboDefaults();
         $.each(countries.countries, function(id, country) {
          dropDown.append(createDropdownElement(country.code));       
    });

    }

      //populate ComboBox
    function populatePopularTable() {
        var i=0;
         $.each(popCurrency, function(id, item) {
             var shade=false;
            if ((id%2)==0) {
                shade=true;
            }
          popularTable.append(popularItem(item.base,item.other,shade));    
    });

    }
    //Calculate
    calculateBtn.click(function() {
        calculateExchangeRate();
    });

    //Swap ComboBox
    $("#swap-top").click(function() {
        //Store left ComboBox Values
        var flagStore=leftComboFlag.attr("class");
        var inputValStore=leftComboInput.val();
        var dataIdStore=leftCombo.attr("data-id");
        //Assign right combo values to left combo
        leftComboFlag.attr("class",rightComboFlag.attr("class"));
        leftComboInput.val(rightComboInput.val());
        leftCombo.attr("data-id",rightCombo.attr("data-id"));
        //Assign stored values to right combo
        rightComboFlag.attr("class",flagStore);
        rightComboInput.val(inputValStore);
        rightCombo.attr("data-id",dataIdStore);
         calculateExchangeRate();

    });

    //Swap ComboBox
    $("#swap-bottom").click(function() {
        //Assign right Input values to left Input
        leftInput.val(rightInput.val());
        //calculate
         calculateExchangeRate();
         console.log(popCurrency);

    })

    //Popular list Click
    popular.delegate(".currencies","click",function(e) {
       var left= $(e.currentTarget).find("span:first-child").attr("data-id");
        var right= $(e.currentTarget).find("span:last-child").attr("data-id");
        comboValues(left,right);
        leftInput.val(1);
        calculateExchangeRate();
    });

     //Filter Drop Down
    $("#currency-app").delegate(".droper", "click", function(e) {
      var clicked = $(e.currentTarget).attr("data-id");
        $("[clicked-id=" + clicked + "]").toggleClass("open");
    });

    $("#currency-app *:not(.dropdown-menu *)").on("click", function() {
        $(".dropdown-menu").removeClass("open");
    });

    $("#currency-app").delegate(".dropdown-menu li", "click", function(e) {
        var  clicked= $(e.currentTarget).attr("data-id");
        var comboBox = $(e.currentTarget).parent().attr("clicked-id");
        var flag=$("#"+comboBox+" li[data-id=" + clicked + "]").find("i").attr("class");
        var currName=$("#"+comboBox+" li[data-id="+ clicked+"]").find("a").text();
        $("#"+comboBox+" i:first-child[data-id=country]").attr("class",flag);
        $("#"+comboBox+" input").val(currName);
        $("#"+comboBox+"").attr("data-id",clicked);

    });
   
});