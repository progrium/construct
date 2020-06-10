import { Session } from "./session.js";

export function setupDivider() {
    const selectTarget = (fromElement, selector) => {
        if (!(fromElement instanceof HTMLElement)) {
            return null;
        }
        return fromElement.querySelector(selector);
    };

    const resizeData = {
        tracking: false,
        startWidth: null,
        startCursorScreenX: null,
        handleWidth: 10,
        resizeTarget: null,
        parentElement: null,
        maxWidth: null,
    };

    $(document.body).on('mousedown', '.Divider', null, (event) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const handleElement = event.currentTarget;
        if (!handleElement.parentElement) {
            console.error(new Error("Parent element not found."));
            return;
        }

        // Use the target selector on the handle to get the resize target.
        const targetSelector = handleElement.getAttribute('data-target');
        const targetElement = selectTarget(handleElement.parentElement, targetSelector);
        if (!targetElement) {
            console.error(new Error("Resize target element not found."));
            return;
        }

        resizeData.startWidth = $(targetElement).outerWidth();
        resizeData.startCursorScreenX = event.screenX;
        resizeData.resizeTarget = targetElement;
        resizeData.parentElement = handleElement.parentElement;
        resizeData.maxWidth = $(handleElement.parentElement).innerWidth() - resizeData.handleWidth;
        resizeData.tracking = true;
    });

    $(window).on('mousemove', null, null, (event) => {
        if (resizeData.tracking) {
            const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX;
            const snappedCursorScreenXDelta = cursorScreenXDelta - (cursorScreenXDelta % 30);
            const newWidth = resizeData.startWidth + snappedCursorScreenXDelta;
            $(resizeData.resizeTarget).outerWidth(newWidth);
            jsPlumb.repaintEverything();
        }
    });

    $(window).on('mouseup', null, null, (event) => {
        if (resizeData.tracking) {
            resizeData.tracking = false;
        }
    });
}

export function setupSortables() {
    $(document).ready(function () {
        // sidebar declarations sorting
        $(".Stack.flex.flex-col").sortable({
            start: function(event, ui) {
                ui.item.startPos = ui.item.index();
                console.log(`Old position for ${ui.item}: ` + ui.item.index());
            },
            stop: function(event, ui) {
                console.log(`New position for ${ui.item}: ` + ui.item.index());
                $("#entrypoint")[0].style['top'] = $(".selected")[0].offsetTop + "px";
                $("#entrypoint")[0].style['height'] = $(".selected")[0].offsetHeight + "px";
                jsPlumb.repaintEverything();
            },
            items: "> div",
            revert: 150,
            tolerance: "intersect",
            handle: ".Dots.mb-1",
            containment: "parent",
            axis: "y",
        });
        $(".Stack.flex.flex-col.pl-1.mt-2").sortable({
            start: function(event, ui) {
                ui.item.startPos = ui.item.index();
                console.log(`Old position for ${ui.item}: ` + ui.item.index());
            },
            stop: function(event, ui) {
                console.log(`New position for ${ui.item}: ` + ui.item.index());
            },
            items: "> div",
            revert: 150,
            tolerance: "pointer",
            handle: ".Dots.Grip.mr-1.mt-1.mb-1",
            containment: "parent",
            axis: "y",
        });
    })
}

export function setupContextMenu() {
    let mocksubitems = {
        "fold1-key1": { "name": "Foo bar" },
        "fold2": {
            "name": "Sub group 2",
            "items": {
                "fold2-key1": { "name": "alpha" },
                "fold2-key2": { "name": "bravo" },
                "fold2-key3": { "name": "charlie" }
            }
        },
        "fold1-key3": { "name": "delta" }
    };

    $.contextMenu({
        selector: '#add-decl',
        trigger: "left",
        build: function ($trigger, e) {
            return {
                callback: function (key, options) {
                    let decl = {"Kind": key}
                    switch (key) {
                    case "function":
                        decl["Function"] = {
                            Name: "newfunc",
                            Entry: "new.0",
                            Blocks: [
                                {Type: "return", ID: "new.0", Position: [6,5]}
                            ],
                        };
                        break;
                    case "type":
                        decl["Type"] = {
                            Name: "newtype",
                            Fields: [],
                            Methods: [],
                        };
                        break;
                    case "variables":
                        decl["Variables"] = [{
                            Name: "newvar",
                        }]
                        break;
                    case "constants":
                        decl["Constants"] = [{
                            Name: "newconst",
                        }]
                        break;
                    case "imports":
                        decl["Imports"] = [{
                            Package: "",
                        }]
                        break;
                    }
                    Session.append("/Package/Declarations", decl);  
                },
                items: {
                    "function": { name: "Function" },
                    "type": { name: "Type" },
                    "variables": { name: "Variables" },
                    "constants": { name: "Constants" },
                    "imports": { name: "Imports" },
                }
            };
        }
    });

    $.contextMenu({
        selector: '.Grid',
        build: function ($trigger, e) {
            return {
                callback: function (key, options) {
                    Session.create(key, e.originalEvent.offsetX, e.originalEvent.offsetY);
                },
                items: {
                    "expr": { name: "Expression" },
                    "call": { name: "Call Statement" },
                    // "locals": { name: "Locals", items: mocksubitems },
                    // "imports": { name: "Imports", items: mocksubitems },
                    // "builtins": { name: "Builtins", items: mocksubitems },
                    // "operators": { name: "Operators", items: mocksubitems },
                    "return": { name: "Return" },
                    "loop": { name: "Loop" },
                    "condition": { name: "Condition" },
                    "assign": { name: "Assign" }
                }
            };
        }
    });
}
