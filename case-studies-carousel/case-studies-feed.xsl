<!DOCTYPE html-entities SYSTEM "http://www.interwoven.com/livesite/xsl/xsl-html.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <!-- ============================================================
         Case Studies Feed - Default XSL
         ============================================================
         Server-side feed template. Queries the DCR store for
         `rbccm/casestudy` records via MetaQueryExternal.findByQuery
         and emits a clean <caseStudies><caseStudy>...</caseStudy>
         </caseStudies> tree.

         Same skeleton as the article feed (article/news), just
         retargeted:
           - qQuery filters on rbccm/casestudy
           - wrapper is <caseStudies> / <caseStudy>
           - <link> is built by prefix-swap on the DCR @path
             (case studies have their own published pages at
              /en/expertise/transactions/case-study/YYYY/MM/slug -
              no ?dcr= querystring viewer needed)
           - author/watchtime/video/story-type fields dropped
             (case study DCRs don't carry them; drop back in later
              if the record schema grows those keys)

         Consumed at runtime by case-studies-carousel.js: the
         component's JS fetches this feed URL on DOMContentLoaded,
         parses the XML, and injects slides into the carousel
         track before slick initializes. No per-page publish walk,
         no DCR picker, no deploy hang.
         ============================================================ -->

    <xsl:include href="http://www.interwoven.com/livesite/xsl/HTMLTemplates.xsl" />
    <xsl:include href="http://www.interwoven.com/livesite/xsl/StringTemplates.xsl" />

    <xsl:template match="/">
        <caseStudies>

            <xsl:variable name="VIEW_PAGE" select="/Properties/Data/Datum[@ID='ViewPage']" />
            <xsl:variable name="ARCHIVE_PAGE" select="/Properties/Data/Datum[@ID='ArchivePage']" />

            <xsl:variable name="RECORDS" select="Properties/Data/Result/records" />

            <xsl:for-each select="$RECORDS/metaResult">
                <xsl:sort select="concat(./attr[ @key = 'TeamSite/Metadata/publishdate' ], ' ', ./attr[ @key = 'TeamSite/Metadata/CreationDate' ])" order="descending" />

                <xsl:variable name="CS_TITLE"       select="./attr[ @key = 'TeamSite/Metadata/Title' ]" />
                <xsl:variable name="CS_DESCRIPTION" select="./attr[ @key = 'TeamSite/Metadata/Description' ]" />
                <xsl:variable name="CS_EYEBROW"     select="./attr[ @key = 'TeamSite/Metadata/subcategory' ]" />
                <xsl:variable name="CS_DATE"        select="./attr[ @key = 'TeamSite/Metadata/publishdate' ]" />
                <xsl:variable name="CS_REGION"      select="./attr[ @key = 'TeamSite/Metadata/region' ]" />
                <xsl:variable name="CS_THUMBNAIL"   select="./attr[ @key = 'TeamSite/Metadata/thumbnail' ]" />
                <xsl:variable name="CS_TAGS"        select="./attr[ @key = 'TeamSite/Metadata/tags' ]" />
                <xsl:variable name="CS_ID"          select="./@path" />
                <xsl:variable name="CS_READTIME"    select="./attr[ @key = 'TeamSite/Metadata/time_to_read' ]" />

                <caseStudy>
                    <xsl:choose>
                        <!-- Manual link override on the record wins if set,
                             same pattern as the article feed. -->
                        <xsl:when test="./attr[ @key = 'TeamSite/Metadata/link' ]!=''">
                            <xsl:variable name="CS_LINK" select="./attr[ @key = 'TeamSite/Metadata/link' ]" />
                            <slug><xsl:value-of select="substring-after($CS_ID, '/casestudy/data/')" /></slug>
                            <date><xsl:call-template name="PUBLISH_DATE"><xsl:with-param name="publish_date" select="$CS_DATE" /></xsl:call-template></date>
                            <link><xsl:value-of select="$CS_LINK" /></link>
                            <thumbnail><xsl:value-of select="$CS_THUMBNAIL" /></thumbnail>
                            <title>
                                <xsl:call-template name="replace-entity">
                                    <xsl:with-param name="text"    select="$CS_TITLE"/>
                                    <xsl:with-param name="find"    select="'&amp;#36;'"/>
                                    <xsl:with-param name="replace" select="'$'"/>
                                </xsl:call-template>
                            </title>
                            <description>
                                <xsl:call-template name="replace-entity">
                                    <xsl:with-param name="text"    select="$CS_DESCRIPTION"/>
                                    <xsl:with-param name="find"    select="'&amp;#36;'"/>
                                    <xsl:with-param name="replace" select="'$'"/>
                                </xsl:call-template>
                            </description>
                            <eyebrow><xsl:value-of select="$CS_EYEBROW" /></eyebrow>
                            <region><xsl:value-of select="$CS_REGION" /></region>
                            <tags><xsl:value-of select="$CS_TAGS" /></tags>
                            <readtime><xsl:value-of select="$CS_READTIME" /></readtime>
                        </xsl:when>

                        <!-- No explicit link on the record: build the
                             public URL from the DCR path.
                             DCR path: templatedata/rbccm/casestudy/data/YYYY/MM/slug
                             Public:   /en/expertise/transactions/case-study/YYYY/MM/slug
                             Substring-after strips everything up to and
                             including "/casestudy/data/" and we prepend
                             the public-URL prefix. Deterministic - every
                             case study has its own page at this URL. -->
                        <xsl:otherwise>
                            <slug><xsl:value-of select="substring-after($CS_ID, '/casestudy/data/')" /></slug>
                            <date><xsl:call-template name="PUBLISH_DATE"><xsl:with-param name="publish_date" select="$CS_DATE" /></xsl:call-template></date>
                            <link>/en/expertise/transactions/case-study/<xsl:value-of select="substring-after($CS_ID, '/casestudy/data/')" /></link>
                            <thumbnail><xsl:value-of select="$CS_THUMBNAIL" /></thumbnail>
                            <title>
                                <xsl:call-template name="replace-entity">
                                    <xsl:with-param name="text"    select="$CS_TITLE"/>
                                    <xsl:with-param name="find"    select="'&amp;#36;'"/>
                                    <xsl:with-param name="replace" select="'$'"/>
                                </xsl:call-template>
                            </title>
                            <description>
                                <xsl:call-template name="replace-entity">
                                    <xsl:with-param name="text"    select="$CS_DESCRIPTION"/>
                                    <xsl:with-param name="find"    select="'&amp;#36;'"/>
                                    <xsl:with-param name="replace" select="'$'"/>
                                </xsl:call-template>
                            </description>
                            <eyebrow><xsl:value-of select="$CS_EYEBROW" /></eyebrow>
                            <region><xsl:value-of select="$CS_REGION" /></region>
                            <tags><xsl:value-of select="$CS_TAGS" /></tags>
                            <readtime><xsl:value-of select="$CS_READTIME" /></readtime>
                        </xsl:otherwise>
                    </xsl:choose>
                </caseStudy>

            </xsl:for-each>
        </caseStudies>
    </xsl:template>


    <!-- Recursive string replace (XSLT 1.0 compatible).
         Same helper the article feed uses - swaps &#36; back to $
         so titles/descriptions with dollar figures render as
         "$464M" and not as raw HTML entities. -->
    <xsl:template name="replace-entity">
        <xsl:param name="text"/>
        <xsl:param name="find"/>
        <xsl:param name="replace"/>
        <xsl:choose>
            <xsl:when test="contains($text, $find)">
                <xsl:value-of select="substring-before($text, $find)"/>
                <xsl:value-of select="$replace"/>
                <xsl:call-template name="replace-entity">
                    <xsl:with-param name="text"    select="substring-after($text, $find)"/>
                    <xsl:with-param name="find"    select="$find"/>
                    <xsl:with-param name="replace" select="$replace"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>


    <!-- Human-readable publish date (e.g. "October 15, 2024") from
         TeamSite's YYYY-MM-DD publishdate. Same helper the article
         feed uses. -->
    <xsl:template name="PUBLISH_DATE">
        <xsl:param name="publish_date" />
        <xsl:variable name="vYear"     select="substring-before($publish_date, '-')" />
        <xsl:variable name="vnumMonth" select="number(substring-before(substring-after($publish_date, '-'), '-'))" />
        <xsl:variable name="vDay"      select="number(substring-after(substring-after($publish_date, '-'), '-'))" />
        <xsl:choose>
            <xsl:when test="$vnumMonth = '1'  or $vnumMonth = '01'">January</xsl:when>
            <xsl:when test="$vnumMonth = '2'  or $vnumMonth = '02'">February</xsl:when>
            <xsl:when test="$vnumMonth = '3'  or $vnumMonth = '03'">March</xsl:when>
            <xsl:when test="$vnumMonth = '4'  or $vnumMonth = '04'">April</xsl:when>
            <xsl:when test="$vnumMonth = '5'  or $vnumMonth = '05'">May</xsl:when>
            <xsl:when test="$vnumMonth = '6'  or $vnumMonth = '06'">June</xsl:when>
            <xsl:when test="$vnumMonth = '7'  or $vnumMonth = '07'">July</xsl:when>
            <xsl:when test="$vnumMonth = '8'  or $vnumMonth = '08'">August</xsl:when>
            <xsl:when test="$vnumMonth = '9'  or $vnumMonth = '09'">September</xsl:when>
            <xsl:when test="$vnumMonth = '10'">October</xsl:when>
            <xsl:when test="$vnumMonth = '11'">November</xsl:when>
            <xsl:when test="$vnumMonth = '12'">December</xsl:when>
        </xsl:choose>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$vDay" />, <xsl:value-of select="$vYear" />
    </xsl:template>

</xsl:stylesheet>
