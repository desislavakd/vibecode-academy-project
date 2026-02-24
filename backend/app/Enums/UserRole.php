<?php

namespace App\Enums;

enum UserRole: string
{
    case Owner    = 'owner';
    case Backend  = 'backend';
    case Frontend = 'frontend';
    case QA       = 'qa';
    case Designer = 'designer';
    case PM       = 'pm';

    public static function default(): self
    {
        return self::Backend;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match($this) {
            self::Owner    => 'Owner',
            self::Backend  => 'Backend Developer',
            self::Frontend => 'Frontend Developer',
            self::QA       => 'QA Engineer',
            self::Designer => 'Designer',
            self::PM       => 'Product Manager',
        };
    }
}
