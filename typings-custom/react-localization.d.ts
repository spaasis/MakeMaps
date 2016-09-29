declare module "react-localization" {
    interface LocalizedStringsMethods {
        setLanguage(language: string): void;
        getLanguage(): string;
        getInterfaceLanguage(): string;
        formatString(str: string, ...values: any[]): string
        getAvailableLanguages(): string[]
    }

    export interface LocalizedStrings {
        new (props: any): LocalizedStringsMethods;
    }

}
