﻿(function ($) {
    if (window.angular) {
        var gta = angular.module('gtui'),

            _dataConfigField = 'table-config',
            _divHTML = '<div></div>',
            _tbodyHTML = 'tbody',

            _getTableClass = function (config) {
                var _tableClass = [gtui.table.constant.TABLE_CLASS];

                if (config.tableBordered) {
                    _tableClass.push(gtui.table.constant.TABLE_BORDERED_CLASS);
                }
                if (config.tableStriped) {
                    _tableClass.push(gtui.table.constant.TABLE_STRIPED);
                }

                return _tableClass.join(' ');
            },
            _getTemplate = function (el, config) {
                // Template outer element
                var _div = $(_divHTML).addClass(gtui.table.constant.TABLE_CONTAINER_CLASS),

                    // tables
                    _originTableTemplate = el.children('table'),
                    _frozenHeaderTemplate,
                    _frozenColumnsTemplate,
                    _frozenColumnsHeaderTemplate,

                    // table wrapers
                    _originTableWrapper = $(_divHTML).addClass(gtui.table.constant.ORIGIN_TABLE_CONTAINER_CLASS),
                    _frozenHeaderWrapper = $(_divHTML).addClass(gtui.table.constant.FROZEN_HEADER_TABLE_CONTAINER_CLASS),
                    _frozenColumnsTableWrapper = $(_divHTML).addClass(gtui.table.constant.FROZEN_COLUMNS_TABLE_CONTAINER_CLASS),
                    _frozenColumnsHeaderWrapper = $(_divHTML).addClass(gtui.table.constant.FROZEN_COLUMNS_TABLE_HEADER_CONTAINER_CLASS),
                        
                    _frozenColumnsCount = parseInt(config.frozenColumnsCount);

                // Deal with frozenColumnsCount.
                _frozenColumnsCount = _frozenColumnsCount ? _frozenColumnsCount : 0;

                var _tableClass = _getTableClass(config);

                // Add classes to original table template.
                _originTableTemplate.addClass(_tableClass);

                // Generate table which holds the frozen headers on top of this table-ish component based on the original table.
                _frozenHeaderTemplate = _originTableTemplate.clone();
                _frozenHeaderTemplate.children(_tbodyHTML).remove();

                // Generate table which holds the frozen columns on left of this table-ish component based on the original table.
                _frozenColumnsTemplate = _originTableTemplate.clone();
                
                // Deal with table that holds the frozen columns: Hide the non-frozen columns with ng-class attribute.
                var _th = _frozenColumnsTemplate.find('> thead > tr > th');
                if (_th.length === 1 && _th.attr('ng-repeat')) {
                    _th.attr('ng-if', '$index < ' + _frozenColumnsCount);
                }
                var _td = _frozenColumnsTemplate.find('> tbody > tr > td');
                if (_td.length === 1 && _td.attr('ng-repeat')) {
                    _td.attr('ng-if', '$index < ' + _frozenColumnsCount);
                }

                // Generate the table holds the headers of the table holds the frozen columns.
                // This table is fixed on top, and fixed on left.
                _frozenColumnsHeaderTemplate = _frozenColumnsTemplate.clone();
                _frozenColumnsHeaderTemplate.children(_tbodyHTML).remove();
                
                _div.append(_originTableWrapper.append(_originTableTemplate))
                    .append(_frozenHeaderWrapper.append(_frozenHeaderTemplate))
                    .append(_frozenColumnsTableWrapper.append(_frozenColumnsTemplate))
                    .append(_frozenColumnsHeaderWrapper.append(_frozenColumnsHeaderTemplate));

                return _div;
            };

        gta.directive('gtuiTable', function ($compile, $timeout) {
            return {
                restrict: "EA",
                scope: false,
                template: function (element, attrs) {
                    // Deal with data-config
                    if (!attrs.config) {
                        console.error('gtui-table: "data-config" attribute is missing.');
                        return _divHTML;
                    }
                    else {
                        var _config = gtui.utils.parseObj(attrs.config);
                        element.data(_dataConfigField, _config)
                    }

                    return _getTemplate(element, _config).prop("outerHTML");
                },
                replace: true,
                transclude: false,
                link: function (scope, element, attrs) {
                    var _frozenCols = parseInt(attrs.frozenColumnsCount),
                        _config = element.data(_dataConfigField);

                    _frozenCols = _frozenCols ? _frozenCols : 0;

                    if (_config.vm) {
                        scope[_config.vm].metaTable = element;
                    }
                    else {
                        scope.metaTable = element;
                    }

                    element.on('sort', scope, function (e) {
                        e.data.$emit('sort', e);
                    });

                    $(document).ready(function () {
                        element.table({
                            frozenColumnsCount: _config.frozenColumnsCount
                        });
                    });
                }
            };
        });
    }
})(jQuery);