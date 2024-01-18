$(function () {
        $('[data-toggle="tooltip"]').tooltip({
            delay: {show: 750, hide: 50}
        })
    });

    $(function () {
        $('[data-toggle="popover"]').popover({
            delay: { "show": 0, hide: 0 }
        })
    });

    $('.popover-dismiss').popover({
        trigger: 'hover'
    });

    editor.session.setMode("ace/mode/" + get_mode(lang));

    $('#lang-select').dropdown('set selected', lang);
    document.getElementById('editor-1').innerHTML = '<a data-toggle="tab">' + get_scriptname(lang) + '</a>';

    $('#lang-select').dropdown('setting', 'onChange', function(value){
        lang = value;
        editor.session.setMode("ace/mode/" + get_mode(lang));
        $("#lang-select").popover('hide');
        document.getElementById('editor-1').innerHTML = '<a data-toggle="tab">' + get_scriptname(lang) + '</a>';
        if (editor_session[0].getValue() === default_content) {
            default_content = get_script(lang);
            editor_session[0].setValue(default_content);
            editor.focus();
            editor.navigateFileEnd();
        }
    });

    $(".nav-tabs").on("click", "a", function(e) {
        // e.stopPropagation();
        e.preventDefault();
        detail_chk = (e.detail === undefined) ? 1 : e.detail;
        if (!$(this).hasClass('add-editor') && !$(this).children('input').hasClass('thVal') && detail_chk == 1) {
            active_editor = parseInt($(this).parent().attr('id').split('-')[1]);
            active_editor_id = $(this);

            editor.setSession(editor_session[active_editor - 1]);
            active_file_name = $(this).html();
            $(this).tab('show');
            editor.focus();
            update_editor_footer();
        }
    })
    .on("click", "span", function() {
        close_tab = $(this).parent();
        close_tab.children('a').click();
        $('#close_file_title').text('Close - ' + active_file_name);
        if (editor.getValue() === "") {
            close_editor_tab();
        }
        else {
            $("#closeEditorTab").modal('show');
        }
    });

    $('#rename_file').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        active_editor_id.dblclick();
    });

    let theme = localStorage.getItem('theme') !== undefined && localStorage.getItem('theme') !== null ? localStorage.getItem('theme') : 'light'

    if ( theme === 'dark') {
        $('body').addClass('dark');
        document.getElementById('toggle-theme').innerHTML = '<i class="fas fa-sun fa-lg"></i>';
        editor.setTheme("ace/theme/tomorrow_night_bright");
    } else {
        $('body').removeClass('dark');
        document.getElementById('toggle-theme').innerHTML = '<i class="fas fa-moon fa-lg"></i>';
        editor.setTheme("ace/theme/textmate");
    }


    $('#toggle-theme').click(function(e) {
        document.body.classList.toggle('dark');
        if ($('body').hasClass("dark")) {
            editor.setTheme("ace/theme/tomorrow_night_bright");
            document.getElementById('toggle-theme').innerHTML = '<i class="fas fa-sun fa-lg"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            editor.setTheme("ace/theme/textmate");
            document.getElementById('toggle-theme').innerHTML = '<i class="fas fa-moon fa-lg"></i>';
            localStorage.setItem('theme', 'light');
        }
        $('#toggle-theme').blur();
        $('[data-toggle="tooltip"]').tooltip('hide');
    });

    $('.add-editor').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        editor_cnt += 1;
        editor_index += 1;
        var id = editor_cnt;
        
        active_editor = id;
        editor_session[active_editor - 1] = ace.createEditSession('', "ace/mode/" + get_mode(lang));
        editor.setSession(editor_session[active_editor - 1]);

        $(this).closest('li').before('<li id="editor-' + id + '"><a data-toggle="tab">Untitled' + id + '</a> <span> <i class="fa fa-times"></i></span></li>');
        // $('.nav-tabs li:nth-child(' + id + ') a').click();

        active_editor_id = $(".nav-tabs li").children('a').last();
        active_editor_id.tab('show');
        active_editor_id.dblclick();
        update_editor_footer();

        editor.selection.on('changeCursor', function(e) {
            update_editor_footer();
        });

        editor.selection.on('changeSelection', function(e) {
            update_editor_footer();
        });
    });

    $(document).on('dblclick', '.nav-tabs > li > a', function (event) {
        if($(event.target).attr('class')!="thVal")
            {
                event.stopPropagation();
                event.preventDefault();
                var currentEle = $(this);
                var value = $(this).html();
                if (value.search('<input') === -1) updateVal(currentEle, value);
        }
    });

    editor.focus();
    editor.navigateFileEnd();

    update_editor_footer();

    editor.selection.on('changeCursor', function(e) {
        update_editor_footer();
    });

    editor.selection.on('changeSelection', function(e) {
        update_editor_footer();
    });

    $('.status button').attr('disabled','disabled');
    $('#stop-btn').attr('disabled', 'disabled');

    socket_options = { 
        transports: ["websocket"], 
        'timeout': 3000, 
        'connect timeout': 3000,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000,
        'reconnectionAttempts': 5
    };

    // ace.config.loadModule("ace/ext/keybinding_menu", function(module) {
    //     module.init(editor);
    // });
