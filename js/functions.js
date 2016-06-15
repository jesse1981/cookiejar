$(document).ready(function() {
    $('.popup_close').click(function() {
        $(this).parent().parent().parent().fadeOut('slow');
    });
    
    // *******************************************//
    // Initialize datetime pickers
    // *******************************************//
    $('.datetime').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm:ss'
    });
    
    // *******************************************//
    // Initialize date pickers
    // *******************************************//
    $('.datepick').datepicker();
    $('.datepick').datepicker("option", "dateFormat", "yy-mm-dd");
	
	$('input[data-type="date"]').datepicker();
    $('input[data-type="date"]').datepicker("option", "dateFormat", "yy-mm-dd");
    
    $('button').click(function(e) {
        e.preventDefault();
    });
    
    // *******************************************//
    // Handle clicks of the dismiss class
    // *******************************************//
    $('.dismiss').click(function() {
        $(this).parent().remove();
    });
    
    // *******************************************//
    // Initialize Textarea TinyMCE controls
    // *******************************************//
	if ($('textarea.tinymce').length) {
		$('textarea.tinymce').tinymce({
			// Location of TinyMCE script
			script_url : '/js/tiny_mce/tiny_mce.js',

			// General options
			theme : "advanced",
			plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,advlist",
			mode: "textareas",
			theme: "advanced",
			width: "300",
			height: "200",

			// Theme options
			//theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
			//theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect",
			theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect",
			//theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
			theme_advanced_buttons2 : "cut,copy,paste,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,cleanup,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
			//theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
			theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
			//theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
			theme_advanced_buttons4 : "moveforward,movebackward,absolute,|,cite,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
			
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : true,
			theme_advanced_resizing_use_cookie : false,


			// Example content CSS (should be your site CSS)
			//content_css : "/css/tinymce.css",

			// Drop lists for link/image/media/template dialogs
			template_external_list_url : "lists/template_list.js",
			external_link_list_url : "lists/link_list.js",
			external_image_list_url : "lists/image_list.js",
			media_external_list_url : "lists/media_list.js",

			// Replace values for the template plugin
			template_replace_values : {
					username : "Some User",
					staffid : "991234"
			}
			
		});
	}
    
    // *******************************************//
    // Automatically init tabs
    // *******************************************//
    $('.tabs').tabs();
    
    // *******************************************//
    // Automatically init auto-completes
    // *******************************************//
    $('.autofill').each(function() {
        $(this).autocomplete({
            source: $(this).attr("ref"),
            minLength: 2,
            select: function( event, ui ) {
                autoCompleteCallback(event,ui);
            }
        });
    });
    
    // *******************************************//
    // Initialize BI toolbar button clicks
    // *******************************************//
    $('.bi-graph .hero').click(function() {
        parameterOpen(false);
    });
    $('.bi-toolbar img:nth-child(2)').click(function() {
        parameterOpen(true,$(this).parent().parent().parent().attr('rel'));
    });
    
    // *******************************************//
    // Initialize BI Parameter Changes
    // *******************************************//
    
    
    // *******************************************//
    // Initialize Parameter toolbar button clicks
    // *******************************************//
    $('.parameter-wrapper .tick').click(function() {
        var rel = $('#report-id').val();
        var url = '';
        if (!parseInt(rel)) {
            // creating...
            url = '/bi/create';
            $.get(url,function(res){
                rel = parseInt(res);
            });
            parameterCreateOutput(rel);
        }
        var renderObj = {};
        
        renderObj.rows          = [];
        renderObj.cols          = [];
        renderObj.parameters    = [];
        
        renderObj.type          = $('#report-type').val();
        renderObj.category      = $('#report-category').val();
        renderObj.name          = $('#report-name').val();
        
        for (var i in parameter_schema) {
            if ((parameter_schema[i].category==renderObj.category) && (parameter_schema[i].name==renderObj.name)) {
                for (var x in parameter_schema[i].parameters) {
                    if (parameter_schema[i].parameters[x].value!=undefined) renderObj.parameters.push({replace: parameter_schema[i].parameters[x].replace,value: parameter_schema[i].parameters[x].value});
                }
                // fill in rest of the data needed
                renderObj.source    = parameter_schema[i].source;
                renderObj.file      = parameter_schema[i].file;
                if (parameter_schema[i].range!=undefined) renderObj.range = parameter_schema[i].range
                if (parameter_schema[i].offset!=undefined) renderObj.offset = parameter_schema[i].offset
            }
        }
        
        $('#parameter-rows li').each(function() {
            renderObj.rows.push($(this).text());
        });
        $('#parameter-cols li').each(function() {
            renderObj.cols.push($(this).text());
        });
        
        parameterRender(rel,renderObj);
        // close
        $('.popup_wrapper').fadeOut('slow');
    });
    $('.exit').click(function(){
        $('.popup_wrapper').fadeOut('slow');
    });
});
// *******************************************//
// jQuery Extended Functions
// *******************************************//
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
// *******************************************//
// Initialize context menu
// *******************************************//
function _mainitems() {
    var items = {
            "edit": {name: "Edit", icon: "edit"},
            "delete": {name: "Delete", icon: "delete"},
            "sep1": "---------",
            "logout": {name: "Logout", icon: "quit"}
        };
    return items;
}
function _subitems() {
    var items = {
            "edit": {"name": "Edit", "icon": "edit"},
            "cut": {"name": "Cut", "icon": "cut"},
            "sep1": "---------",
            "quit": {"name": "Quit", "icon": "quit"},
            "sep2": "---------",
            "fold1": {
                "name": "Sub group", 
                "items": {
                    "fold1-key1": {"name": "Foo bar"},
                    "fold2": {
                        "name": "Sub group 2", 
                        "items": {
                            "fold2-key1": {"name": "alpha"},
                            "fold2-key2": {"name": "bravo"},
                            "fold2-key3": {"name": "charlie"}
                        }
                    },
                    "fold1-key3": {"name": "delta"}
                }
            },
            "fold1a": {
                "name": "Other group", 
                "items": {
                    "fold1a-key1": {"name": "echo"},
                    "fold1a-key2": {"name": "foxtrot"},
                    "fold1a-key3": {"name": "golf"}
                }
            }
        };
    return items;
}
function fetchMenuItems(obj) {
    try {
        return modItems(obj);
    }
    catch(e) {
        return _mainitems(obj);
    }
}
$(function(){
    $.contextMenu({
        selector: '.context-menu',
        build: function($trigger, e) {
            return {
                callback: function(key, options) {
                    contextAction(key,$(this));
                },
                items: fetchMenuItems($(this))
            }
        }
    });
    
    $('.context-menu').on('click', function(e){
        console.log('clicked', this);
    })
});
function contextAction(key,obj) {
    var url="";
	var current = document.location.href;
	var arrCurrent = current.split("/");
	var module = arrCurrent[3];
    switch(key) {
        case "edit":
			url = "/"+module+"/add/"+obj.attr('rel');
            gotoUrl(url);
            break;
        case "contentEdit":
            obj.attr('contentEditable',true);
            break;
        case "saveBlog":
            obj.removeAttr('contentEditable');
            var data="blog_id="+obj.parent().attr('rel')+"&blog_data="+escape(obj.html())+"&action=save";
            $.ajax({
                url: document.location,
                data: data,
                type: "POST",
                success: function(data, textStatus, jqXHR){
                    alert('Item saved.'); 
                }
            });
            break;
        case "deleteblog":
            if (confirm("Are you sure you wish to delete this entry?")) {
                var data="blog_id="+obj.parent().attr('rel')+"&action=delete";
                $.ajax({
                    url: document.location,
                    data: data,
                    type: "POST",
                    success: function(data, textStatus, jqXHR){
                        obj.parent().remove(); 
                    }
                });
            }
            break;
        case "deleteblogattach":
            // ensure has attachment
            var objAttach = obj.prev();
            if (objAttach.hasClass('attach')) {
                if (confirm("Are you sure you wish to remove this attachment?")) {
                    var data="blog_id="+obj.parent().attr('rel')+"&action=deleteblogattach";
                    $.ajax({
                        url: document.location,
                        data: data,
                        type: "POST",
                        success: function(data, textStatus, jqXHR){
                            objAttach.remove();
                        }
                    });
                }
            }
            break;
        case "delete":
            if (confirm('Are you sure you wish to delete this item?')) {
                var data = "module="+obj.attr('module')+"&id="+obj.attr('rel')+"&mode=delete";
                $.ajax({
                    url: document.location,
                    data: data,
                    success: function(data, textStatus, jqXHR){
                        location.reload(); 
                    }
                });
            }
            break;
        default:
            alert ("No action for "+key);
            break;
    }
}
// *******************************************//
// BI Parameter Functions
// *******************************************//
$(document).ready(function() {
    $('#main-content').css('max-width',($('body').innerWidth()-$('#side-nav').outerWidth()-50)+'px');
    
    $('select#report-category').change(function() {
        parameterPopulateReports($(this).val());
    });
    $('select#report-name').change(function() {
        parameterPopulateParams($('select#report-category').val(),$(this).val());
        parametersPopulateFields($('select#report-category').val(),$(this).val());
    });
    $('#report-parameters-value').blur(function() {
        // find parameter
        for (var a in parameter_schema) {
            if ((parameter_schema[a].category   ==  $('#report-category').val()) && 
                (parameter_schema[a].name       ==  $('#report-name').val())) {
                for (var b in parameter_schema[a].fields) {
                    if (parameter_schema[a].parameters[b]==$('#report-parameters').val()) {
                        // found, set value
                        parameter_schema[a].parameters[b].value = $(this).val();
                    }
                }
            }
        }
    });
    $('#report-parameters').change(function() {
        // find parameter
        for (var a in parameter_schema) {
            if ((parameter_schema[a].category   ==  $('#report-category').val()) && 
                (parameter_schema[a].name       ==  $('#report-name').val())) {
                for (var b in parameter_schema[a].parameters) {
                    if (parameter_schema[a].parameters[b].label==$('#report-parameters').val()) {
                        // found, set value (if any), set mask
                        if (parameter_schema[a].parameters[b].placeholder!=undefined) {
                            $('#report-parameters-value').mask(parameter_schema[a].parameters[b].placeholder.mask);
                            $('#report-parameters-value').attr("placeholder",parameter_schema[a].parameters[b].placeholder.display);
                        }
                        if (parameter_schema[a].parameters[b].value!=undefined) $('#report-parameters-value').val(parameter_schema[a].parameters[b].value);
                        
                    }
                }
            }
        }
    });
});
function parameterCreateOutput(id) {
    // locate hero
    var hero = $('.bi-graph .hero').parent().parent();
    var output = hero.before('<div class="one-third bi-graph" rel="'+id+'"><div class="bi-toolbar"><div class="floatRight"><img src="/img/toolbar-refresh.png" /><img src="/img/toolbar-edit.png" /><img src="/img/toolbar-delete.png" /></div></div><div id="output'+id+'"></div></div>');
    return output;
}
function parameterOpen(edit,rel) {
    if (edit==undefined) edit = false;
    
    if (edit) $('#report-id').val(rel);
    else $('#report-id').val(0);
    
    $(function() {
        $( ".connectedSortable" ).sortable({
            connectWith: ".connectedSortable"
        }).disableSelection();
    });
    
    // populate fields
    var parameter_cats = [];
    $('select#report-category').children().remove();
    $('select#report-category').append('<option>-- Please Select --</option>');
    for (var i in parameter_schema) {
        if (parameter_cats.indexOf(parameter_schema[i].category)==-1) parameter_cats.push(parameter_schema[i].category);
    }
    for (var i in parameter_cats) {
        $('select#report-category').append('<option>'+parameter_cats[i]+'</option>');
    }
    parameterPopulateReports('');
    parameterPopulateParams('');
    parametersPopulateFields('');
    $('#report-type').val("-- Please Select --");
    
    $('.parameter-wrapper').fadeIn('slow');
}
function parameterPopulateReports(cat) {
    $('select#report-name').children().remove();
    $('select#report-name').append('<option>-- Please Select --</option>');
    for (var i in parameter_schema) {
        if (parameter_schema[i].category==cat) $('select#report-name').append('<option>'+parameter_schema[i].name+'</option>');
    }
}
function parameterPopulateParams(cat,report) {
    $('select#report-parameters').children().remove();
    $('select#report-parameters').append('<option>-- Please Select --</option>');
    for (var i in parameter_schema) {
        if ((parameter_schema[i].category==cat) && (parameter_schema[i].name==report)) {
            for (var x in parameter_schema[i].parameters) {
                $('select#report-parameters').append('<option>'+parameter_schema[i].parameters[x].label+'</option>');
            }
        }
    }
}
function parametersPopulateFields(cat,report) {
    $('#parameter-rows').children().remove();
    $('#parameter-fields').children().remove();
    $('#parameter-cols').children().remove();
    for (var i in parameter_schema) {
        if ((parameter_schema[i].category==cat) && (parameter_schema[i].name==report)) {
            for (var x in parameter_schema[i].fields) {
                $('#parameter-fields').append('<li class="ui-state-default" style="">'+parameter_schema[i].fields[x]+'</li>');
            }
        }
    }
}
function parameterRender(rel,obj) {
    var data = JSON.stringify(obj);
    var result = {};
    var postdata = "id="+rel+"&data="+data;
    $.ajax({
        url: '/bi/getJsonDataset',
        type: 'POST',
        data: postdata,
        success: function(res) {
            if (parseInt(res)<0) {
                switch (parseInt(res)) {
                    case -1:
                        alert("("+rel+") Failed to get a connection to the data source.");
                        break;
                    case -2:
                        alert("("+rel+") Failed to read the source file.");
                        break;
                    case -3:
                        alert("("+rel+") Zero rows returned.");
                        break;
                }
                return;
            }
            else {
                result = JSON.parse(res);
                
                $("#output"+rel).children().remove();
                if (obj.type!="Pivot Table") {
                    $("#output"+rel).pivot(result, {
                        renderers: $.extend(
                            $.pivotUtilities.renderers, 
                            $.pivotUtilities.gchart_renderers, 
                            $.pivotUtilities.d3_renderers
                            ),
                        derivedAttributes: {
                            /*
                            "Age Bin": derivers.bin("Age", 10),
                            "Gender Imbalance": function(mp) {
                                return mp["Gender"] == "Male" ? 1 : -1;
                            }
                            */
                        },
                        cols: obj.cols, rows: obj.rows
                    });
                }
                else {
                    $("#output"+rel).pivotUI(result, {
                        renderers: $.extend(
                            $.pivotUtilities.renderers, 
                            $.pivotUtilities.gchart_renderers, 
                            $.pivotUtilities.d3_renderers
                            ),
                        derivedAttributes: {
                            /*
                            "Age Bin": derivers.bin("Age", 10),
                            "Gender Imbalance": function(mp) {
                                return mp["Gender"] == "Male" ? 1 : -1;
                            }
                            */
                        },
                        cols: obj.cols, rows: obj.rows,
                        rendererName: obj.type+" Chart"
                    });
                }
            }
        }
    });
}
// *******************************************//
// Modal Dialogs
// *******************************************//
function initDialog(title,destroyOnClose,callback,name,action) {
    $('body').append('<div id="dialog-form" title="'+title+'"></div>');
    $( "#dialog-form" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Submit": function() {
                var ajaxValues;
                var processData = true;
                
                if ($('#dialog-form form input[type="file"]').length){
                    ajaxValues = new FormData($('#dialog-form form')[0]);
                    processData = false;                        
                }
                else {
                    ajaxValues = $("#dialog-form form").serialize();
                }
                
                var ajaxUrl = $("#dialog-form form").attr('action');
                var id=0;
                $.ajax({
                    data: ajaxValues,
                    async: false,
                    type: 'POST',
                    datatype: 'text',
                    url: ajaxUrl,
                    processData: processData,
                    success: function(data) {
                        id = data;
                    }
                });
                window[callback](id);
                $( this ).dialog( "close" );
                return false;
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            //allFields.val( "" ).removeClass( "ui-state-error" );
            if (destroyOnClose) {
                $( "#dialog-form" ).dialog( "destroy" );
                $( "#dialog-form" ).remove();
            }
        }
    });
    appendForm($( "#dialog-form" ),name,action);
    return $( "#dialog-form form" );
}
function openDialog() {
    $( "#dialog-form" ).dialog( "open" );
    $('.ui-dialog-buttonset button:first-child').addClass('btn btn-primary');
    $('.ui-dialog-buttonset button:last-child').addClass('btn');
}
// *******************************************//
// Form aids
// *******************************************//
function appendForm(obj,name,action) {
    obj.append('<form id="'+name+'_id" name="'+name+'" action="'+action+'" method="post" enctype="multipart/form-data"></form>');
}
function appendDetail(obj,label,name,value) {
    obj.append('<label></label>');
    var labelElement = obj.find('label:last-child');
    labelElement.attr('for', name+"_id");
    labelElement.text(label);

    obj.append('<input/>');
    var inputElement = obj.find('input:last-child');
    inputElement.attr('id', name+"_id");
    inputElement.attr('name', name);
    inputElement.val(value);
}
function appendFile(obj,label,name) {
    obj.append('<label></label>');
    var labelElement = obj.find('label:last-child');
    labelElement.attr('for', name+"_id");
    labelElement.text(label);

    obj.append('<input type="file" name="'+name+'" id="'+name+'_id" />');
}
function appendCheckbox(obj,label,name,checked) {
    obj
        .append(
            $(document.createElement('label')).attr({
                'for':  name + "_id"
            }).text( label )
        )
        .append(
        $(document.createElement("input")).attr({
             id:    name + "_id"
            ,name:  name
            //,value: item
            ,type:  'checkbox'
            ,checked:valToBool(checked)
        })/*.click( function( event ){
            var cbox = $(this)[0];
            alert( cbox.value );
        })*/
    );
}
function appendMultiple(obj,label,name,items,selectVal,multiple) {
    if (typeof(multiple)=='undefined') multiple = false;
    obj
        .append(
            $(document.createElement('label')).attr({
                'for':  name + "_id"
            }).text( label )
        )
    var selector = document.createElement('select');
    selector.id = name+"_id";
    selector.name = name;
    selector.multiple = multiple;

    var optionPlease = document.createElement('option');
    optionPlease.value = 0;
    optionPlease.text = '-- Please Select --';
    selector.appendChild(optionPlease);

    for (var i in items) {
            var selected = (selectVal==items[i].id||selectVal==items[i].value) ? true:false;
            var optionItem = document.createElement('option');
            optionItem.value = items[i].id;
            optionItem.text = items[i].value;
            if (selected) {
                optionItem.selected = true;
            }
            selector.appendChild(optionItem);
    }

    obj.append(selector);
}
function appendImage(obj,src) {
    obj
        .append(
            $(document.createElement('img')).attr({
                'src':  src
            })
        )
}
function appendOption(obj,name,value,parent) {
    var selectItem = document.getElementById(obj);
    var optionItem = document.createElement('option');
    optionItem.value = value;
    optionItem.text = name;
    selectItem.appendChild(optionItem);
    if (parent!=undefined) {
        $(optionItem).attr('parent',parent);
    }
}
function appendHidden(obj,name,value) {
    obj.append('<input/>');
    var inputElement = obj.find('input:last-child');
    inputElement.attr('id', name+"_id");
    inputElement.attr('name', name);
    inputElement.css('display', "none");
    inputElement.attr('value',value);
}
// *******************************************//
// AJAX Content (mini)
// *******************************************//
function getMini(module,func,callbackId) {
    var url = "?module="+module+"&action="+func;
    $.ajax({
        url: url,
        success: function(data) {
            $('#'+callbackId).html(data);
            $('#'+callbackId).slideDown('slow');
        }
    });
}
function getCols(object) {
    var fields = {};
    $.ajax({
        url: '/admin/getCols/'+object+'/json',
        async: false,
        success: function(data) {
            fields = JSON.parse(data);
        }
     });
     return fields;
}
// *******************************************//
// Sharepoint Functions
// *******************************************//
function sharepointRemoveOuter() {
    var ids = ["suitebar","ms-hctest","s4-ribbonrow","s4-titlerow","sideNavBox"];
    for (var i in ids) {
        $('#'+ids[i]).remove();
    }
    $('#contentBox').css('margin',0);
}
// *******************************************//
// All other misc functions
// *******************************************//
function gotoUrl(url) {
    window.location = url;
}
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}
function checkRegexp( o, regexp) {
    if ( !( regexp.test( o.val() ) ) ) {
        o.addClass( "ui-state-error" );
        //updateTips( n );
        return false;
    } else {
        return true;
    }
}
function checkEmail(obj) {
    return checkRegexp( obj,
                        /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
}
function valToBool(val) {
    if (val) return true;
    else return false;
}
function strip(val,str) {
    return val.replace(str,"");
}
function gotoModuleHome() {
    var url = window.location.href;
    url = url.substr(0,url.indexOf("&"));
    gotoUrl(url);
}
function showAlert(title,body) {
    $('.popup_title').text(title);
    $('.popup_body').append("<p>"+body+"</p>");
    $('.popup_wrapper').fadeIn('slow');
}
function convertTable(tableid,data) {
	for (var i in data[0]) {
		if (i!="id") $('#'+tableid+' thead tr').append('<th>'+i+'</th>');
	}
	for (var a in data) {
		$('#'+tableid+' tbody').append('<tr rel="'+data[a]["id"]+'"></tr>');
		for (var b in data[a]) {
			if (b!="id") $('#'+tableid+' tbody tr:last-child').append('<td>'+data[a][b]+'</td>');
		}
	}
	$('#'+tableid).DataTable({
		lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
		dom: 'T<"clear">lfrtip',
		tableTools: {
			"sSwfPath": "/js/copy_csv_xls_pdf.swf"
		}
	});
	$(function(){
		$.contextMenu({
			selector: '#'+tableid+' tbody tr',
			build: function($trigger, e) {
				return {
					callback: function(key, options) {
						contextAction(key,$(this));
					},
					items: fetchMenuItems($(this))
				}
			}
		});
		
		$('.context-menu').on('click', function(e){
			console.log('clicked', this);
		})
	});
	// activate default click option
	$('#'+tableid+' tbody tr').click(function() {
		gotoUrl(window.location+'/add/'+$(this).attr('rel'));
	});
}