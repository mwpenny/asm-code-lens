

import * as assert from 'assert';
import * as re from '../src/regexes';
import { AssertionError } from 'assert';
//import * as path from 'path';
//const fs = require('fs-extra');


suite('RegExes', () => {
    
    suite('Simple regexes', () => {

        function checkResultsMatch(regex: RegExp, insOuts: (string|boolean)[]) {
            try {
                // Check the test
                const count = insOuts.length;
                const div = 2;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const input = insOuts[i] as string;
                    const shouldMatch = insOuts[i+1];
                    const result = regex.exec(input);
                    if(result) {
                        assert.ok(shouldMatch, "A match was found although no match should be found. Line " + (i/div));
                    }
                    else {
                        assert.ok(!shouldMatch, "No match was found although a match should be found. Line " + (i/div));
                    }
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexLabelEquOrMacro', (done) => {
            const regex = re.regexLabelEquOrMacro();
            const insOuts = [
                // input-line, match
                "label:equ", true,
                "label:macro", true,
                "label: MACRO", true,
                "label: equ", true,
                "label: equ;", true,

                "label: equ ;", true,
                "label equ", true,
                "label equ ", true,
                "label equ;", true,
                "equ  ", false,
                " equ  ", false,
                ];

            checkResultsMatch(regex, insOuts);
            done();
        });


        function checkResultsMatchFound(regex: RegExp, insOuts: (string|boolean)[]) {
            try {
                // Check the test
                const count = insOuts.length;
                const div = 3;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const input = insOuts[i] as string;
                    const shouldMatch = insOuts[i+1];
                    const shouldFind = insOuts[i+2];
                    const result = regex.exec(input);
                    if(result) {
                        assert.ok(shouldMatch, "A match was found although no match should be found. Line " + (i/div));
                        const found = result[1];
                        assert.equal(found, shouldFind, "'" + found + "' == '" + shouldFind + "', Line " + (i/div));
                    }
                    else {
                        assert.ok(!shouldMatch, "No match was found although a match should be found. Line " + (i/div));
                    }
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexInclude', (done) => {
            const regex = re.regexInclude();
            const insOuts = [
                // input-line, match, found-file
                'include   "sound.asm" ', true, "sound.asm",
                '  INCLUDE "src/sound.asm"', true, "src/sound.asm",
                'include   abcd ', false, "",
                'includex   "sound.asm" ', false, "",
                ];

                checkResultsMatchFound(regex, insOuts);
            done();
        });


        test('regexFuzzyFind 1', (done) => {
            assert.equal("\\w*a", re.regexPrepareFuzzy("a"));
            assert.equal("\\w*a\\w*b\\w*c", re.regexPrepareFuzzy("abc"));
            assert.equal("", re.regexPrepareFuzzy(""));
            done();
        });

        test('regexFuzzyFind 2', (done) => {
            const insOuts = [
                // input-line, search-word, should-match
                "snd", "snd", true,
                "sound", "snd", true,
                "asound", "snd", true,
                "sounds", "snd", true,
                "soun", "snd", false,
                "sounkkkd", "snd", true,
                ];

            try{ 
                // Check the test
                const count = insOuts.length;
                const div = 3;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const input = insOuts[i] as string;
                    const searchWordRaw = insOuts[i+1] as string;
                    
                    // To be tested function:
                    const searchWord = re.regexPrepareFuzzy(searchWordRaw);

                    const regex = new RegExp(searchWord);
                    const shouldMatch = insOuts[i+2] as boolean;
                    const result = regex.exec(input);
                    if(result) {
                        assert.ok(shouldMatch, "A match was found although no match should be found. Line " + (i/div));
                    }
                    else {
                        assert.ok(!shouldMatch, "No match was found although a match should be found. Line " + (i/div));
                    }
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }

            done();
        });
    });


    suite('RegEx 1 capture', () => {

        function checkResults1Capture(regex: RegExp, insOuts: string[]) {
            try {
                // Check the test
                const count = insOuts.length;
                const div = 3;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const input = insOuts[i];
                    const prefix = insOuts[i+1];
                    const label = insOuts[i+2];
                    const result = regex.exec(input);
                    if(result) {
                        const foundPrefix = result[1];
                        const foundLabel = result[2];
                        assert.equal(prefix, foundPrefix, "'" + prefix + "' == '" + foundPrefix + "', Line " + (i/div));
                        assert.equal(label, foundLabel, "'" + label + "' == '" + foundLabel + "', Line " + (i/div));
                    }
                    else 
                        assert.equal(label, '', "'" + label + "' == '', Line " + (i/div));
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexLabelColon', (done) => {
            const regex = re.regexLabelColon();
            const insOuts = [
                // input-line, found-prefix, found-label
                "label1:", "", "label1",
                "label1:  defb 0 ; comment", "", "label1",
                "Label1:", "", "Label1",
                "label_0123456789: ", "", "label_0123456789",
                "l:", "", "l",
                "0l:", "", "",
                "_l: ", "", "_l",
                "label.init: ", "", "label.init",
                "label._init:", "", "label._init",
                "label ", "", "",
                
                "label", "", "",
                "  label2:", "  ", "label2",
                "  label2: ", "  ", "label2",
                "   label2:defw 898; comm", "   ", "label2",
                "   label2.loop:", "   ", "label2.loop",
                ".label:", "", "",
                " .label:", "", "",
                " .label: ", "", "",
                ];

            checkResults1Capture(regex, insOuts);
            done();
        });


        test('regexLabelWithoutColon', (done) => {
            const regex = re.regexLabelWithoutColon();
            const insOuts = [
                "label1", "", "label1",
                "label1  defb 0 ; comment", "", "label1",
                "Label1", "", "Label1",
                "label_0123456789 ", "", "label_0123456789",
                "l", "", "l",
                "0l", "", "",
                "_l ", "", "_l",
                "label.init ", "", "label.init",
                "label._init", "", "label._init",
                "label ", "", "label",

                "label", "", "label",
                "  label2", "", "",
                "  label2 ", "", "",
                "   label2 defw 898; comm", "", "",
                "   label2.loop", "", "",
                ".label", "", "",
                " .label", "", "",
                " .label ", "", "",
                "label:", "", "",
            ];

            checkResults1Capture(regex, insOuts);
            done();
        });
    });


    suite('RegEx with search-word', () => {

        // insOuts: search-word, input-line, should-match, found-prefix
        function checkResultsSearchWord(func: (string) => RegExp, insOuts: (string|boolean)[]) {
            try {
                // Check the test
                const count = insOuts.length;
                const div = 4;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const searchWord = insOuts[i];
                    const input = insOuts[i+1] as string;
                    const shouldMatch = insOuts[i+2];
                    const prefix = insOuts[i+3];
                    const regex = func(searchWord);
                    const result = regex.exec(input);
                    if(result) {
                        assert.ok(shouldMatch, "A match was found although no match should be found. Line " + (i/div) + ", searched for: '" + searchWord + "'");
                        const foundPrefix = result[1];
                        assert.equal(prefix, foundPrefix, "'" + prefix + "' == '" + foundPrefix + "', Prefix of line " + (i/div));
                    }
                    else {
                        assert.ok(!shouldMatch, "No match was found although a match should be found. Line " + (i/div) + ", searched for: '" + searchWord + "'");
                    }
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexLabelColonForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "label", "label:", true, "",
                "label", "label: ", true, "",
                "label", "label:;", true, "",
                "label", "  label:", true, "  ",
                "label", "   label: ", true, "   ",
                "label", " label:;", true, " ",
                "label", "label", false, "",
                "label", "label ", false, "",
                "label", "label;", false, "",
                "LabelA_0123456789", "LabelA_0123456789:", true, "",

                "_LabelA_0123456789", "_LabelA_0123456789:", true, "",
                "label", "xxx.label:", true, "",
                "label", "_xxx.label:", true, "",
                "label", "0xxx.label:", false, "",   
                "label", ".label:", false, "",
                "label", "label.xxx:", false, "",
                "label", "yyy.label.xxx:", false, "",
                "label", "xlabel:", false, "",
                "label", "labely:", false, "",
                "label", "xxx.xlabel:", false, "",
                "label", "xlabel.yyy:", false, "",
                ];

            checkResultsSearchWord(re.regexLabelColonForWord, insOuts);
            done();
        });


        test('regexLabelWithoutColonForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "label", "label", true, "",
                "label", "label ", true, "",
                "label", "label;", true, "",
                "label", "  label", false, "",
                "label", "   label ", false, "",
                "label", " label;", false, "",
                "label", " label", false, "",
                "label", " label ", false, "",
                "label", " label;", false, "",
                "LabelA_0123456789", "LabelA_0123456789", true, "",

                "_LabelA_0123456789", "_LabelA_0123456789", true, "",
                "label", "xxx.label", true, "",
                "label", "_xxx.label", true, "",
                "label", "0xxx.label", false, "",
                "label", ".label", false, "",
                "label", "label.xxx", false, "",
                "label", "yyy.label.xxx", false, "",
                "label", "xlabel", false, "",
                "label", "labely", false, "",
                "label", "xxx.xlabel", false, "",
                "label", "xlabel.yyy", false, "",
                "label", "label:", false, "",
                "label", "label: ", false, "",
                "label", "label:;", false, "",
                "label", "xxx.label:", false, "",
                ];

            checkResultsSearchWord(re.regexLabelWithoutColonForWord, insOuts);
            done();
        });


        test('regexModuleForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "m", "module m", false, "",
                "m", " module m", true, " module ",
                "m", " MODULE m", true, " MODULE ",
                "m", " module x", false, "",
                "Mm_0123456789", "  module Mm_0123456789;", true, "  module ",
                ];

            checkResultsSearchWord(re.regexModuleForWord, insOuts);
            done();
        });


        test('regexMacroForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "m", "macro m", false, "",
                "m", " macro m", true, " macro ",
                "m", " MACRO m", true, " MACRO ",
                "m", " macro x", false, "",
                "Mm_0123456789", "  macro Mm_0123456789;", true, "  macro ",
                ];

            checkResultsSearchWord(re.regexMacroForWord, insOuts);
            done();
        });


        test('regexStructForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "m", "struct m", false, "",
                "m", " struct m", true, " struct ",
                "m", " STRUCT m", true, " STRUCT ",
                "m", " struct x", false, "",
                "Mm_0123456789", "  struct Mm_0123456789;", true, "  struct ",
                ];

            checkResultsSearchWord(re.regexStructForWord, insOuts);
            done();
        });


        test('regexAnyReferenceForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "label", "label ", true, "",
                "label", " label", true, " ",
                "label", " jr label", true, " jr ",
                "label", " jr label2", false, "",
                "label", " jr zlabel", false, "",

                "label", "  jr nz,label", true, "  jr nz,",
                "label", "  jr nz,label.init", true, "  jr nz,",
                "label", "  jr nz,init.label.l3", true, "  jr nz,init.",
                "label", "  jr nz,init.label", true, "  jr nz,init.",
                "label", "  ld a,(init.label)", true, "  ld a,(init.",
                
                "label", "  ld a,(ix+init.label)", true, "  ld a,(ix+init.",
                "label", "  ld a,(ix-init.label)", true, "  ld a,(ix-init.",
                "label", "  ld a,(5+init.label)", true, "  ld a,(5+init.",
                "label", "  ld a,(5-init.label*8)", true, "  ld a,(5-init.",
                ];

            checkResultsSearchWord(re.regexAnyReferenceForWord, insOuts);
            done();
        });


        // insOuts: search-word, input-line, number of matches, found1, found2, ...
        function checkResultsSearchWordGlobal(func: (string) => RegExp, insOuts: (string|number)[]) {
            try {
                // Check the test
                const count = insOuts.length;
                let i=0;
                let lineNumber = 0;
                while(i<count) {
                    const searchWord = insOuts[i++];
                    const input = insOuts[i++] as string;
                    const countMatches = insOuts[i++] as number;
                    const regex = func(searchWord);
                    if(countMatches == 0) {
                        // Assure that there is no match
                        const result = regex.exec(input);
                        assert.equal(result, undefined, "A match was found although no match should be found. Line " + lineNumber + ", searched for: '" + searchWord + "'");
                    }
                    else {
                        // Compare all matches
                        for(let m=0; m<countMatches; m++) {
                            const prefix = insOuts[i++] as string;
                            const result = regex.exec(input);
                            assert.notEqual(result, undefined, "No match was found although a match should be found. Line " + lineNumber + ", searched for: '" + searchWord + "' (" + m + ")");
                            const foundPrefix = result[1];
                            assert.equal(prefix, foundPrefix, "'" + prefix + "' == '" + foundPrefix + "', Prefix of line " + lineNumber + " (" + m + ")");
                        }
                    }

                    // Next
                    lineNumber++;
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexAnyReferenceForWordGlobal', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "label", "label ", 1, "",
                "label", " label", 1, " ",
                "label", " jr label", 1, " jr ",
                "label", " jr label2", 0, "",
                "label", " jr zlabel", 0, "",

                "label", "  jr nz,label", 1, "  jr nz,",
                "label", "  jr nz,label.init", 1, "  jr nz,",
                "label", "  jr nz,init.label.l3", 1, "  jr nz,init.",
                "label", "  jr nz,init.label", 1, "  jr nz,init.",
                "label", "  ld a,(init.label)", 1, "  ld a,(init.",
                
                "label", "  ld a,(ix+init.label)", 1, "  ld a,(ix+init.",
                "label", "  ld a,(ix-init.label)", 1, "  ld a,(ix-init.",
                "label", "  ld a,(5+init.label)", 1, "  ld a,(5+init.",
                "label", "  ld a,(5-init.label*8)", 1, "  ld a,(5-init.",

                "label", "label: djnz sound.label", 2, "", ": djnz sound.",
                ];

                checkResultsSearchWordGlobal(re.regexAnyReferenceForWordGlobal, insOuts);
            done();
        });
    });


    

    suite('RegEx with search-word 2, weg', () => {

        // insOuts: search-word, input-line, should-match, found-prefix
        function checkResultsSearchWord(func: (string) => RegExp, insOuts: (string|boolean)[]) {
            try {
                // Check the test
                const count = insOuts.length;
                const div = 4;  // Line divider
                assert.equal(count % div, 0, "Testcase error: Number of lines in input and output should be equal, otherwise the test is wrong!");
                for(let i=0; i<count; i+=div) {
                    const searchWord = insOuts[i];
                    const input = insOuts[i+1] as string;
                    const shouldMatch = insOuts[i+2];
                    const prefix = insOuts[i+3];
                    const regex = func(searchWord);
                    const result = regex.exec(input);
                    if(result) {
                        assert.ok(shouldMatch, "A match was found although no match should be found. Line " + (i/div) + ", searched for: '" + searchWord + "'");
                        const foundPrefix = result[1];
                        assert.equal(prefix, foundPrefix, "'" + prefix + "' == '" + foundPrefix + "', Prefix of line " + (i/div));
                    }
                    else {
                        assert.ok(!shouldMatch, "No match was found although a match should be found. Line " + (i/div) + ", searched for: '" + searchWord + "'");
                    }
                }
            }
            catch(e) {
                assert.fail("Testcase assertion: " + e);
            }
        }

        test('regexLabelColonForWord', (done) => {
            const insOuts = [
                // search-word, input-line, should-match, found-prefix
                "label", "label:", true, "",
                "label", "label: ", true, "",
                "label", "label:;", true, "",
                "label", "  label:", true, "  ",
                "label", "   label: ", true, "   ",
                "label", " label:;", true, " ",
                "label", "label", false, "",
                "label", "label ", false, "",
                "label", "label;", false, "",
                "LabelA_0123456789", "LabelA_0123456789:", true, "",

                "_LabelA_0123456789", "_LabelA_0123456789:", true, "",
                "label", "xxx.label:", true, "",
                "label", "label.xxx:", false, "",
                "label", "yyy.label.xxx:", false, "",
                "label", "xlabel:", false, "",
                "label", "labely:", false, "",
                "label", "xxx.xlabel:", false, "",
                "label", "xlabel.yyy:", false, "",
                ];

            checkResultsSearchWord(re.regexLabelColonForWord, insOuts);
            done();
        });
    });

});