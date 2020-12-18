/** Unit testing for KeyManager Module
 *
 * @author Raul Aragonez (r.aragonez@topl.me)
 * @date 2020.12.14
 *
 */

const KeyManager = require("../../src/modules/KeyManager");

const assert = require("assert");
const chai = require('chai');
const expect = chai.expect;

/* -------------------------------------------------------------------------- */
/*                          KeyManager unit tests                             */
/* -------------------------------------------------------------------------- */
describe("KeyManager", () => {
    // run this before all tests
    before(() => {
        //keymanager = new KeyManager();
        keyMan = new KeyManager('password_test');
    });

    // run this before every test
    beforeEach(() => {
    });

    // run this after every test
    afterEach(() => {
    });

    /* ---------------------------- KeyManager Constructor Tests -------------------------------- */
    describe('new keymanager()', function() {
        /* ---------------------------- invalid passwords -------------------------------- */
        function testInvalidPasswords(test) {
            it('should fail if password is ' + test.it, async () => {
                assert.throws(function() { new KeyManager(test.value) }, Error, 'Error: A password must be provided at initialization');
            });
        }
        describe('invalid passwords', function() {
            let testCasess = [
                {"it":"123", "value":123},
                {"it":"[]", "value":[]},
                {"it":"{}", "value":{}},
                {"it":"5.12", "value":5.12},
                {"it":"[[]]", "value":[[]]},
                {"it":"undefined", "value":undefined},
                {"it":"{password:123}", "value":{password:123}},
                {"it":"{password:[]}", "value":{password:[]}},
                {"it":"{password:undefined}", "value":{password:undefined}},
                {"it":"{invalidPasswordKey:'invalidKey'}", "value":{invalidPasswordKey:"invalidKey"}}
            ];

            testCasess.forEach((test) => {
                testInvalidPasswords(test);
            });
        });

        /* ---------------------------- valid passwords -------------------------------- */
        function testGenerateKey(test) {
            it('should generate key using password ' + test.it, async () => {
                let keyMan = new KeyManager(test.value);
                expect(keyMan).to.have.property('pk');
                console.log(keyMan.pk);
                //assert.isNotNull(keyMan.pk, 'great, time for tea!');
                //assert.typeOf(keyMan.pk, 'string', 'we have a string');
                //expect(keyMan).to.have.own.property('pk');
            });
        }
        describe('generate key w/ valid password', function() {
            let testCasess = [
                {"it":"passwordtest", "value":"passwordtest"},
                {"it":"this_is_a_password", "value":"this_is_a_password"},
                {"it":"!@#$%^&*(_special_@#$2021", "value":"!@#$%^&*(_special_@#$2021"}
            ];

            testCasess.forEach((test) => {
                //testGenerateKey(test);
            });
        });
        describe('generate key w/ keypath', function() {
            let testCasess = [
                {"it":"passwordtest", "value":"passwordtest"},
                {"it":"this_is_a_password", "value":"this_is_a_password"},
                {"it":"!@#$%^&*(_special_@#$2021", "value":"!@#$%^&*(_special_@#$2021"}
            ];

        });
    });

    describe('lockKey()', function() {
        it('should pass if lockKey getter returns boolean', async () => {
            assert.strictEqual(typeof keyMan.isLocked, "boolean", "lockKey getter returns boolean");
        });
        it('should fail if lockKey setter called', async () => {
            assert.throws(function() {
                keyMan.isLocked = false;
            }, Error, 'Error: Invalid private variable access, use lockKey() instead.');
        });
        it('should lock key', async () => {
            keyMan.lockKey();
            assert.strictEqual(keyMan.isLocked, true, "Key is locked");
        });
        it('should fail to unlock key with invalid password', async () => {
            // lock key
            keyMan.lockKey();

            // call unlockKey() without a valid password
            assert.throws(function() {
                keyMan.unlockKey();
            }, Error, 'Error: Invalid password');
        });
        it('should fail to unlock key with invalid password', async () => {
            // lock key
            keyMan.lockKey();

            // call unlockKey() without a valid password
            assert.throws(function() {
                keyMan.unlockKey("this_is_an_invalid_password");
            }, Error, 'Error: Invalid password');
        });
        it('should unlock key with valid password', async () => {
            keyMan.lockKey();
            assert.strictEqual(keyMan.isLocked, true, "Key is locked");

            // unlock key with the correct password
            keyMan.unlockKey('password_test');
            assert.strictEqual(keyMan.isLocked, false, "Key is unlocked");
        });
        it('should throw error if key already unlocked', async () => {
            keyMan.lockKey();
            assert.strictEqual(keyMan.isLocked, true, "Key is locked");

            // unlock key with the correct password
            keyMan.unlockKey('password_test');
            assert.strictEqual(keyMan.isLocked, false, "Key is unlocked");

            // attempt to unlock again
            assert.throws(function() {
                keyMan.unlockKey('password_test');
            }, Error, 'Error: The key is already unlocked');
        });
    });

    describe('getKeyStorage()', function() {
        it('should pass if key is unlocked', async () => {
            // key is unlocked by default
            let keyStorage = keyMan.getKeyStorage();
            //console.log(keyMan.getKeyStorage());

            assert.strictEqual(typeof keyStorage, "object");
            expect(keyStorage).to.have.property('publicKeyId');
            expect(keyStorage).to.have.property('crypto');
        });
        it('should fail if key is locked', async () => {
            // lock key
            keyMan.lockKey();

            // attempt to get keyStorage when locked
            assert.throws(function() {
                keyMan.getKeyStorage();
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');

            //assert.isNotNull(keyMan.pk, 'great, time for tea!');
            //assert.typeOf(keyMan.pk, 'string', 'we have a string');
            //expect(keyMan).to.have.own.property('pk');
        });
        it('should fail if Key not initialized properly', async () => {
            // manipulate pk? Should we protect it?
            keyMan.pk = "";

            //instead this initialization should block us
            //let keyStorage = keyMan.getKeyStorage();
            assert.throws(function() {
                keyMan.getKeyStorage();
            }, Error, 'Error: A password must be provided at initialization');
            //console.log(keyMan.getKeyStorage());

            //assert.isNotNull(keyMan.pk, 'great, time for tea!');
            //assert.typeOf(keyStorage, 'object', 'key storage is an obj');
            // assert.strictEqual(typeof keyStorage, "object");
            // expect(keyStorage).to.have.property('publicKeyId');
            // expect(keyStorage).to.have.property('crypto');
            //expect(keyMan).to.have.own.property('pk');
        });
        it('should fail if Key not initialized properly', async () => {
            // manipulate pk? Should we protect it?
            keyMan.pk = "";

            //instead this initialization should block us
            //let keyStorage = keyMan.getKeyStorage();
            assert.throws(function() {
                keyMan.getKeyStorage();
            }, Error, 'Error: A password must be provided at initialization');
        });
    });

    describe('sign()', function() {
        it('should fail if key is locked', async () => {
            // lock key
            keyMan.lockKey();

            // attempt to sign when key is locked
            assert.throws(function() {
                keyMan.sign("topl_signature");
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should fail if message is empty', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // attempt to sign with invalid message
            assert.throws(function() {
                keyMan.sign("");
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should fail if message is not a string', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // attempt to sign with invalid message
            assert.throws(function() {
                keyMan.sign([]);
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should padd if message is a string', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // sign with invalid message
            let signedKey = keyMan.sign("topl_valid_msg");
            assert.strictEqual(typeof signedKey, "object");
            assert.strictEqual(signedKey.constructor, Uint8Array);
            assert.strictEqual(signedKey.length, 64);
        });
    });

    describe('exportToFile()', function() {
        // before(() => {
        //     //keymanager = new KeyManager();
            
        // });
        let keyMan = new KeyManager('password_test');

        it('should fail if keypath param is []', async () => {
            // export using an invalid keypath
            assert.throws(function() {
                keyMan.exportToFile([]);
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should fail if keypath param is {"keyPath":"invalid key"}', async () => {
            // export using an invalid keypath
            assert.throws(function() {
                keyMan.exportToFile({"keyPath":"invalid key"});
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should pass if keypath param not provided', async () => {
            console.log(keyMan.pk)
            // export using an invalid keypath
            //let keyMan = new KeyManager("testing");
            let test = keyMan.exportToFile();
            console.log(test)
        });
        // it('should pass with valid keypath', async () => {
        //     // export using an invalid keypath
            
        //     let keyMan = new KeyManager("testing");
        //     let test = keyMan.exportToFile('');
        //     console.log(test)
        // });





        it('should fail if message is empty', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // attempt to sign with invalid message
            assert.throws(function() {
                keyMan.sign("");
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should fail if message is not a string', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // attempt to sign with invalid message
            assert.throws(function() {
                keyMan.sign([]);
            }, Error, 'Error: Key manager is currently locked. Please unlock and try again.');
        });
        it('should padd if message is a string', async () => {
            // ensure key is properly unlocked
            keyMan.lockKey();
            keyMan.unlockKey("password_test");

            // sign with invalid message
            let signedKey = keyMan.sign("topl_valid_msg");
            assert.strictEqual(typeof signedKey, "object");
            assert.strictEqual(signedKey.constructor, Uint8Array);
            assert.strictEqual(signedKey.length, 64);
        });
    });
});