<?php
/**
 * Divi-friendly ACF shortcodes for the Sleep Landing Page fields.
 *
 * Paste this into a child theme functions.php file or a Code Snippets entry.
 * Then use a Divi Code module with:
 * [sleep_landing_wysiwyg field="sleep_landing_curriculum_html"]
 */

add_shortcode('sleep_landing_wysiwyg', function ($atts) {
    if (!function_exists('get_field')) {
        return '';
    }

    $atts = shortcode_atts(
        [
            'field' => '',
            'id' => 0,
        ],
        $atts,
        'sleep_landing_wysiwyg'
    );

    $allowed_fields = [
        'sleep_landing_intro_html',
        'sleep_landing_program_formats_html',
        'sleep_landing_curriculum_html',
        'sleep_landing_final_cta_html',
    ];

    $field = sanitize_key($atts['field']);
    if (!in_array($field, $allowed_fields, true)) {
        return '';
    }

    $post_id = absint($atts['id']);
    if (!$post_id) {
        $post_id = get_the_ID() ?: get_queried_object_id();
    }

    $content = get_field($field, $post_id);
    if (!is_string($content) || $content === '') {
        return '';
    }

    return apply_filters('the_content', $content);
});
