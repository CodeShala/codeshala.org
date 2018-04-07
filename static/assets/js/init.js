$(document).ready(function () {
    $(".sidebar-box").click(function () {
        totalHeight = 0
        totalHeight = $(this)[0].scrollHeight;
        $(this)
            .css({
                "max-height": totalHeight
            })
            .animate({
                "height": totalHeight
            });
        $('.readmore').fadeOut();
        return false;
    });
    //ACE Editor Settings
    var editor = ace.edit("editor", {
        mode: "ace/mode/c_cpp",
        selectionStyle: "text"
    })

    editor.setOptions({
        autoScrollEditorIntoView: true,
        copyWithEmptySelection: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false
    });

//Predefined Code Templates
    var templateC = '#include <stdio.h>\n\nint main() {\n\tprintf("Hello world!");\n\t\n\t//Your code here\n\treturn 0;\n}';
    var templateCPP = '#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout<<"Hello world!";\n\treturn 0;\n}';
    var templatePython = '#code\nprint("Hello world!")';
    editor.session.setValue(templateC);
    $('#selectLanguage').change(function () {
        var languageChosenByUser = $(this).val();
        //console.log('User Switched To '+languageChosenByUser);
        if (languageChosenByUser == "c") {
            editor.session.setMode("ace/mode/c_cpp");
            editor.session.setValue(templateC);
        } else if (languageChosenByUser == "c++" || languageChosenByUser == "c++14") {
            editor.session.setMode("ace/mode/c_cpp");
            editor.session.setValue(templateCPP);
        } else if (languageChosenByUser == "Python" || languageChosenByUser == "Python3") {
            editor.session.setMode("ace/mode/python");
            editor.session.setValue(templatePython);
        }
    })

    $('#selectTheme').change(function () {
        var themeChosenByUser = $(this).val();
        console.log('User Switched To ' + themeChosenByUser);
        if (themeChosenByUser == "default") {
            editor.setTheme("ace/theme/textmate");
        } else if (themeChosenByUser == "twilight") {
            editor.setTheme("ace/theme/twilight");
        }
    })

    $('#customInputDiv').hide();
    $('#checkCustomInput').click(function () {
        if ($(this).is(':checked')) {
            $('#customInputDiv').show();
        } else {
            $('#customInputDiv').hide();
        }
    })
    $('#divOutput').hide();
    $('#runCodeBtn').click(function () {
        $('#stdout').html('<img src="/load.gif">');
        $('#time').html('<img src="/load.gif">');
        $('#memory').html('<img src="/load.gif">');
        $('#divOutput').show();
        $.ajax({
            type: "POST",
            url: "/run",
            data: {
                language: $('#selectLanguage').val(),
                code: editor.session.getValue(),
                input: $('#usersSTDIN').val()
            },
            success: function (data) {
                console.log(data);
                response = data;
                $('#stdout').html(response.output + response.rntError + response.cmpError);
                $('#time').html(response.time);
                $('#memory').html(response.memory);
            },
            error: function (data) {
                console.log('Internet Issues!');
                $('#stdout').html("Internet Issues");
            }
        });
    })
});