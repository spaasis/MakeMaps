declare module L {
    module ExtraMarkers {
        var version: string;

        function icon(options: ExtraMarkers.IconOptions): ExtraMarkers.Icon;

        interface IconStatic extends L.IconStatic {
            /**
              * Creates an icon instance with the given options.
              */
            new (options: IconOptions): Icon;

            Default: {
                /**
                  * Creates a default icon instance with the given options.
                  */
                new (options?: IconOptions): Icon.Default;

                imagePath: string;
            };
        }

        interface Icon extends L.Icon {
            options: ExtraMarkers.IconOptions;
        }

        interface IconOptions extends L.IconOptions {
            /**
            * Name of the icon. See glyphicons or font-awesome.
            */
            icon?: string;

            /**
            * Select de icon library. 'fa' for font-awesome or 'glyphicon' for bootstrap 3.
            */
            prefix?: 'fa' | 'glyphicon';

            /**
            * Color of the marker
            */
            markerColor?: string;

            /**
            * Color of the icon. 'white', 'black' or css code (hex, rgba etc).
            */
            iconColor?: 'white' | 'black' | string;

            /**
            * Make the icon spin. true or false. Font-awesome required
            */
            spin?: boolean;

            /**
            * Additional classes in the created tag
            */
            extraClasses?: string;

            shape?: 'circle' | 'square' | 'star' | 'penta';
            svg?: boolean;
            svgBorderColor: string,
            svgOpacity: number,
        }

        var Icon: ExtraMarkers.IconStatic;
    }
}
